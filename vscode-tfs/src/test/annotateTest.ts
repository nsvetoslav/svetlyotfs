import * as vscode from 'vscode';
import * as path from 'path';
import { TFSCommandExecutor } from '../TFS/Commands';

/**
 * Test function to debug the annotate command output
 */
export async function testAnnotateCommand() {
    try {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found');
            return;
        }

        // Get the TFS command executor
        const tfsExecutor = TFSCommandExecutor.getInstance();

        // Run the annotate command on the current file
        const blameResult = await tfsExecutor.annotate(editor.document.uri);
        
        if (blameResult) {
            // Log the blame result for debugging
            console.log('Blame result:', blameResult);
            
            // Show the result in a message
            vscode.window.showInformationMessage(`Annotate command successful. Processed ${blameResult.blameInfo.length} lines.`);
            
            // Show detailed information for the first few lines
            const sampleLines = blameResult.blameInfo.slice(0, 5);
            for (const line of sampleLines) {
                console.log(`Line ${line.lineNumber}: Changeset ${line.changesetId} by ${line.author} on ${line.date}`);
            }
        } else {
            vscode.window.showErrorMessage('No blame information returned');
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error running annotate command: ${error.message}`);
        console.error('Error running annotate command:', error);
    }
}
