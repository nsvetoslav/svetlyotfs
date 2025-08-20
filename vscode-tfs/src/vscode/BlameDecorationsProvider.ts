import * as vscode from "vscode";
import { BlameResult, BlameInfo } from "../TFS/Types";

export class BlameDecorationsProvider {
    private static instance: BlameDecorationsProvider;
    private decorationType: vscode.TextEditorDecorationType;
    private paddingDecorationType: vscode.TextEditorDecorationType;  // spacer

    private constructor() {
        this.decorationType = vscode.window.createTextEditorDecorationType({
            before: {
                color: new vscode.ThemeColor('editorLineNumber.foreground'),
                fontStyle: 'italic',
                margin: '0 10px 0 0'
            },
            rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen
        });

        this.paddingDecorationType = vscode.window.createTextEditorDecorationType({
            before: {
                // just reserves space; no text
                margin: '0 10px 0 0'
            },
            rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen
        });
    }

    public static getInstance(): BlameDecorationsProvider {
        if (!BlameDecorationsProvider.instance) {
            BlameDecorationsProvider.instance = new BlameDecorationsProvider();
        }

        return BlameDecorationsProvider.instance;
    }

    public showBlameInformation(editor: vscode.TextEditor, blameResult: BlameResult) {
        if (!blameResult?.blameInfo) return;

        const blocks = this.groupBlameInfoIntoBlocks(blameResult.blameInfo);

        // Compute max width in characters
        const maxWidth = this.calculateMaxBlameWidth(blocks);
        const reservedWidth = `${maxWidth + 2}ch`; // +2 for gap

        // Collect lines that have blame decorations
        const linesWithBlame = new Set<number>();
        for (const block of blocks) {
            const firstLine = block.startLine - 1;
            if (firstLine >= 0) {
                linesWithBlame.add(firstLine);
            }
        }

        // 1) Spacer only on lines WITHOUT blame decorations
        const paddingDecos: vscode.DecorationOptions[] = [];
        for (let i = 0; i < editor.document.lineCount; i++) {
            // Skip lines that have blame decorations
            if (linesWithBlame.has(i)) {
                continue;
            }

            const range = new vscode.Range(i, 0, i, 0);
            paddingDecos.push({
                range,
                renderOptions: { before: { contentText: '', width: reservedWidth } }
            });
        }

        // 2) Label only on the first line of each block
        const labelDecos: vscode.DecorationOptions[] = [];
        for (const block of blocks) {
            const firstLine = block.startLine - 1;
            if (firstLine < 0) continue;

            const authorInitials = this.getAuthorInitials(block.author);
            const formattedDate = this.formatDate(block.date);
            const text = `${authorInitials} ${block.changesetId}`;

            labelDecos.push({
                range: new vscode.Range(firstLine, 0, firstLine, 0),
                renderOptions: { before: { contentText: text, width: reservedWidth } },
                hoverMessage: this.createHoverMessage(block)
            });
        }

        // Apply separately so they don't clobber each other
        editor.setDecorations(this.paddingDecorationType, paddingDecos);
        editor.setDecorations(this.decorationType, labelDecos);
    }

    public hideBlameInformation(editor: vscode.TextEditor) {
        editor.setDecorations(this.paddingDecorationType, []);
        editor.setDecorations(this.decorationType, []);
    }

    private loadingInterval: NodeJS.Timeout | undefined;
    private spinnerFrames: string[] = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    private currentFrameIndex: number = 0;

    public showLoadingIndicator(editor: vscode.TextEditor) {
        // Clear any existing loading animation
        this.hideLoadingIndicator();

        // Create an animated loading indicator in the first line
        const range = new vscode.Range(0, 0, 0, 0);
        const decorations: vscode.DecorationOptions[] = [{
            range: range,
            renderOptions: {
                before: {
                    contentText: this.spinnerFrames[this.currentFrameIndex],
                    color: new vscode.ThemeColor('editorLineNumber.foreground'),
                    fontStyle: 'italic',
                    fontWeight: 'normal'
                }
            }
        }];

        // Apply decorations to the editor
        editor.setDecorations(this.paddingDecorationType, decorations);

        // Start animation
        this.loadingInterval = setInterval(() => {
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.spinnerFrames.length;
            const decorations: vscode.DecorationOptions[] = [{
                range: range,
                renderOptions: {
                    before: {
                        contentText: this.spinnerFrames[this.currentFrameIndex],
                        color: new vscode.ThemeColor('editorLineNumber.foreground'),
                        fontStyle: 'italic',
                        fontWeight: 'normal'
                    }
                }
            }];
            editor.setDecorations(this.paddingDecorationType, decorations);
        }, 100);
    }

    public hideLoadingIndicator() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = undefined;
            this.currentFrameIndex = 0;
        }
    }
    private groupBlameInfoIntoBlocks(blameInfo: BlameInfo[]): any[] {
        if (blameInfo.length === 0) {
            return [];
        }

        const blocks = [];
        let currentBlock = {
            startLine: blameInfo[0].lineNumber,
            endLine: blameInfo[0].lineNumber,
            author: blameInfo[0].author,
            changesetId: blameInfo[0].changesetId,
            date: blameInfo[0].date
        };


        for (let i = 1; i < blameInfo.length; i++) {
            const info = blameInfo[i];

            // Check if this line continues the current block
            if (info.author === currentBlock.author &&
                info.changesetId === currentBlock.changesetId &&
                info.date === currentBlock.date &&
                info.lineNumber === currentBlock.endLine + 1) {
                // Extend the current block
                currentBlock.endLine = info.lineNumber;
            } else {
                if (currentBlock.endLine < info.lineNumber)
                    currentBlock.endLine = info.lineNumber - 1;

                // Finish the current block and start a new one
                blocks.push(currentBlock);
                currentBlock = {
                    startLine: info.lineNumber,
                    endLine: info.lineNumber,
                    author: info.author,
                    changesetId: info.changesetId,
                    date: info.date
                };
            }
        }

        // Don't forget the last block
        blocks.push(currentBlock);

        return blocks;
    }

    private calculateMaxBlameWidth(blocks: any[]): number {
        let maxWidth = 0;

        for (const block of blocks) {
            const authorInitials = this.getAuthorInitials(block.author);
            const formattedDate = this.formatDate(block.date);
            const blameText = `${authorInitials} ${block.changesetId} ${formattedDate}`;
            maxWidth = Math.max(maxWidth, blameText.length);
        }

        return maxWidth;
    }

    private getAuthorInitials(author: string): string {
        // Extract initials from author name
        const parts = author.split(' ');
        if (parts.length === 1) {
            return parts[0].substring(0, 2);
        } else if (parts.length >= 2) {
            return parts[0].charAt(0) + parts[1].charAt(0);
        }
        return author.substring(0, 2);
    }

    private formatDate(dateString: string): string {
        // Format date to a more compact form
        // This is a simple implementation - you might want to adjust based on your needs
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    private createHoverMessage(block: any): vscode.MarkdownString {
        // Create a detailed hover message with full information
        const hoverMessage = new vscode.MarkdownString();
        hoverMessage.appendMarkdown(`**Author:** ${block.author}\n\n`);
        hoverMessage.appendMarkdown(`**Changeset:** ${block.changesetId}\n\n`);
        hoverMessage.appendMarkdown(`**Date:** ${block.date}\n\n`);
        hoverMessage.appendMarkdown(`**Lines:** ${block.startLine}-${block.endLine}`);
        return hoverMessage;
    }
}