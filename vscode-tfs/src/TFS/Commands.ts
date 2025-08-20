import * as vscode from "vscode"
import * as path from 'path'
import * as fs from 'fs'
<<<<<<< HEAD
import { tf } from "./Spawn";
import { WorkspaceInfo } from "./Types";
=======
import { spawnSync } from "child_process"
import * as iconv from 'iconv-lite';
import { tf } from "./Spawn";
import { WorkspaceInfo, BlameInfo, BlameResult } from "./Types";
>>>>>>> b5f1d075e6ade18c3604ffd846e00406554efdc3
import { FileNode } from "../vscode/PendingChangesTreeView";
import { Settings } from "../common/Settings";
import { Utilities } from "../common/Utilities";

enum TeamServerCommands {
    Add = "add",
    CheckIn = "checkin",
    CheckOut = "checkout",
    View = "view",
    Delete = "delete",
    Get = "get",
    Rename = "rename",
    Undo = "undo",
    Status = "status",
    Workspaces = "workspaces",
    Reconcile = "reconcile",
    History = "history",
}

enum TeamServerCommandLineArgs {
    Recursive = "/recursive",
    OutputDirectory = "/output",
    XmlFormat = "/format:xml",
    DetailedFormat = "/format:detailed",
    Workspace = "/workspace:",
    NoPrompt = "/noprompt",
    Adds = "/adds",
    Promote = "/promote",
    Version = "/version:C"
}

export class TFSCommandExecutor {
    private static instance: TFSCommandExecutor;
    private constructor() { }

<<<<<<< HEAD
=======
    static changesetInfo = new Map<number, {user: string, date: string}>();

>>>>>>> b5f1d075e6ade18c3604ffd846e00406554efdc3
    public static getInstance(): TFSCommandExecutor {
        if (!TFSCommandExecutor.instance) {
            TFSCommandExecutor.instance = new TFSCommandExecutor();
        }

        return TFSCommandExecutor.instance;
    }

    private getActiveWorkspace () : string | undefined {
        return Settings.getInstance().getActiveTfsWorkspace();
    }

    private getActiveWorkspaceAsCommandLineArgument() : string {
        return this.getActiveWorkspace() ? TeamServerCommandLineArgs.Workspace + this.getActiveWorkspace() : '';
    }

    public async add(uri: vscode.Uri) {
        try{
            await tf([TeamServerCommands.Add, Utilities.removeLeadingSlash(uri), TeamServerCommandLineArgs.NoPrompt]);
            // await tf([TeamServerCommands.Reconcile, TeamServerCommandLineArgs.Promote, TeamServerCommandLineArgs.Adds, TeamServerCommandLineArgs.NoPrompt]);
            vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} succesfully added in version control.`);
        } catch(error: any) {
            // vscode.window.showErrorMessage(`TFS: Adding ${path.basename(uri.fsPath)} in version control failed. Error: ${error.message}.`);
        } 
    }

    public async checkIn(uri: vscode.Uri) {
        try {
            await tf([TeamServerCommands.CheckIn, this.getActiveWorkspaceAsCommandLineArgument(), Utilities.removeLeadingSlash(uri), TeamServerCommandLineArgs.Recursive])
            vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} succesfully checked in version control.`);
        } catch (error: any) {
            // vscode.window.showErrorMessage(`TFS: Checking ${path.basename(uri.fsPath)} in version control failed. Error: ${error.message}.`);
        } 
    }

    public async checkOut(uri: vscode.Uri) {
        try {
            await tf([TeamServerCommands.CheckOut, Utilities.removeLeadingSlash(uri), TeamServerCommandLineArgs.Recursive])
            vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} succesfully checked out in version control.`);
        } catch (error: any) {
            if (error.message.includes('opened for edit')) {
                vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} succesfully checked out in version control.`);
            } else {
                // For other errors, show the error message
                // vscode.window.showErrorMessage(`TFS: Checking out ${path.basename(uri.fsPath)} in version control failed. Error: ${error.message}.`);
            }
        } 
    }

    public async compareFilesFromHistory(uri: vscode.Uri, changeset1: string, changedBy1: string, changeset2: string, changedBy2: string) {
        const firstChangesetFileTemporaryPath = Utilities.generateTemporaryFileNameFromDate(changedBy1 + '-' + changeset1);
        const secondChangesetFileTemporaryPath = Utilities.generateTemporaryFileNameFromDate(changedBy2 + '-' + changeset2);

        try {
            await tf([TeamServerCommands.View, Utilities.getRelativePath(uri),
                `${TeamServerCommandLineArgs.Version}${changeset1}`, 
                `${TeamServerCommandLineArgs.OutputDirectory}:${firstChangesetFileTemporaryPath}`])

            await tf([TeamServerCommands.View, Utilities.getRelativePath(uri), 
                `${TeamServerCommandLineArgs.Version}${changeset2}`, 
                `${TeamServerCommandLineArgs.OutputDirectory}:${secondChangesetFileTemporaryPath}`])

            const firstChangesetFileTemporaryDocument = await vscode.workspace.openTextDocument(firstChangesetFileTemporaryPath);
            const secondChangesetFileTemporaryDocument = await vscode.workspace.openTextDocument(secondChangesetFileTemporaryPath);
            
            vscode.commands.executeCommand("vscode.diff", secondChangesetFileTemporaryDocument.uri, firstChangesetFileTemporaryDocument.uri).then(() => {
                fs.unlinkSync(firstChangesetFileTemporaryPath);
                fs.unlinkSync(secondChangesetFileTemporaryPath);
            });
        } catch (error: any) {
            // vscode.window.showErrorMessage(`TFS: Comparing ${path.basename(firstChangesetFileTemporaryPath)} with ${path.basename(secondChangesetFileTemporaryPath)} failed. Error: ${error.message}.`);
        }
    }

    public async compare(localUri: FileNode) {
        const temporaryFilePath = Utilities.generateTemporaryFileNameFromUri(localUri);
        try {
            await tf([TeamServerCommands.View, localUri.filePath, 
                `${TeamServerCommandLineArgs.OutputDirectory}:${temporaryFilePath}`])

                const temporaryDocument = await vscode.workspace.openTextDocument(temporaryFilePath);
                const localDocument = await vscode.workspace.openTextDocument(localUri.filePath);
                
                vscode.commands.executeCommand("vscode.diff", temporaryDocument.uri, localDocument.uri).then(() => {
                    fs.unlinkSync(temporaryFilePath);
                });
            } catch (error: any) {
            // vscode.window.showErrorMessage(`TFS: Comparing ${path.basename(localUri.filePath)} with latest failed. Error: ${error.message}.`);
        }
    }

    public async delete(uri: vscode.Uri) {
        try{
            await tf([TeamServerCommands.Delete, Utilities.removeLeadingSlash(uri), TeamServerCommandLineArgs.Recursive]);
            vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} succesfully deleted from version control.`);
        } catch(error: any) {
            // vscode.window.showErrorMessage(`TFS: Deleting ${path.basename(uri.fsPath)} failed. Error: ${error.message}.`);
        } 
    }

    public async get(uri: vscode.Uri) {
        try{
            await tf([TeamServerCommands.Get, this.getActiveWorkspaceAsCommandLineArgument(), Utilities.removeLeadingSlash(uri), TeamServerCommandLineArgs.Recursive]);
            vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} is now latest.`);
        } catch(error: any) {
            // vscode.window.showErrorMessage(`TFS: Getting ${path.basename(uri.fsPath)} failed. Error: ${error.message}.`);
        } 
    }

    public async rename(oldUri: vscode.Uri, newUri: vscode.Uri) {
        await this.add(newUri);
        await this.delete(oldUri);
    }

    public async status(uri: vscode.Uri) {
        let tfTask;

        try {
            tfTask = await tf([TeamServerCommands.Status, 
                this.getActiveWorkspaceAsCommandLineArgument(),
                TeamServerCommandLineArgs.Recursive,
                TeamServerCommandLineArgs.XmlFormat,
                `${Utilities.removeLeadingSlash(uri)}`]);

                return await Utilities.tfsStatusXmlToTypedArray(tfTask);
        } catch (error: any) {
            // vscode.window.showErrorMessage(`TFS": Getting workspace files status from version control failed. Error ${error.message}}`)
        }

        return undefined;
    }

    public async undo(uri: FileNode | FileNode) {
        try{
            await tf([TeamServerCommands.Undo, uri.getPath(), this.getActiveWorkspaceAsCommandLineArgument(), TeamServerCommandLineArgs.Recursive]);
            vscode.window.showInformationMessage(`TFS: Undoing changes in version control for ${path.basename(uri.filePath)} completed successfully.`);
        } catch(error: any) {
            vscode.window.showErrorMessage(`TFS: Undoing changes for ${path.basename(uri.filePath)} failed. Error: ${error.message}.`);
        } 
    }

    public async fileHistory(uri : vscode.Uri) {
        let fileHistory = '';
        try {
            fileHistory = await tf([TeamServerCommands.History, 
                Utilities.removeLeadingSlash(uri), 
                TeamServerCommandLineArgs.Recursive, 
                TeamServerCommandLineArgs.DetailedFormat]);
<<<<<<< HEAD

=======
>>>>>>> b5f1d075e6ade18c3604ffd846e00406554efdc3
        } catch(error: any) {
            // No errror messages for extra functionalities ^^, if the execution doesn't succeed that means TFS is garbage.
        }

        return await Utilities.parseTfHistoryOutput(fileHistory);
    }

    public async getWorkspaces() {
        let task;
        try {
            task = await tf([TeamServerCommands.Workspaces])
            const splittedConnectionsOutput = task.split('\n');
            const workspaceInfo: WorkspaceInfo = {
                collection: '',
                workspaces: []
              };
            
            for (let i = 0; i < splittedConnectionsOutput.length; i++) {
                const line = splittedConnectionsOutput[i].trim();
                if (line.startsWith('Collection:')) {
                    workspaceInfo.collection = line.substring('Collection:'.length).trim();
                } else if (line && i >= 3) {
                    const workspaceName = line.split(/\s+/)[0];
                    workspaceInfo.workspaces.push(workspaceName);
                }
            }
            return workspaceInfo;
        } catch (error: any) {
            // vscode.window.showErrorMessage(`TFS: Retrieving workspaces from version control failed: Error ${error.message}`)
        } 

        return undefined;
    }

    public async checkIsCheckedOut(uri: vscode.Uri) {
        try {
            const task = await tf([TeamServerCommands.Status, this.getActiveWorkspaceAsCommandLineArgument(), Utilities.removeLeadingSlash(uri)]);
            if (task != 'There are no pending changes.\r\n') {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
<<<<<<< HEAD
}
=======
    
    public async annotate(uri: vscode.Uri): Promise<BlameResult | undefined> {
        const tfptPath: string | undefined = vscode.workspace.getConfiguration("tfs").get("tfptLocation");
        
        if (!tfptPath) {
            throw new Error("tfpt.exe path is not configured");
        }
        
        try {
            // Execute tfpt annotate command
            const args = ["annotate", Utilities.removeLeadingSlash(uri), "/noprompt"];
            const task = spawnSync(tfptPath, args, { encoding: 'buffer' });
            
            if (task.stderr.toString().length > 0) {
                throw new Error(task.stderr.toString());
            }
            
            const outputString = iconv.decode(task.stdout, 'win1251');
            
            // Parse the annotate output to get changeset IDs
            const blameResult = this.parseAnnotateOutput(uri.fsPath, outputString);
            
            // Get user information for each changeset
            const changesetIds = [...new Set(blameResult.blameInfo.map(info => info.changesetId))];
            await this.getChangesetUsers(changesetIds, uri);
            
            // Update blame info with actual user names and dates
            for (const blameInfo of blameResult.blameInfo) {
                if (TFSCommandExecutor.changesetInfo.has(blameInfo.changesetId)) {
                    const info = TFSCommandExecutor.changesetInfo.get(blameInfo.changesetId);
                    if (info) {
                        blameInfo.author = info.user || blameInfo.author;
                        if (info.date) {
                            blameInfo.date = info.date;
                        }
                    }
                }
            }
            
            return blameResult;
        } catch (err: any) {
            throw new Error(err.stderr ? err.stderr : err.message);
        }
    }
    
    private async getChangesetUsers(changesetIds: number[], fileUri: vscode.Uri){
        
        // For each changeset ID, get the user information using tf history
        for (const changesetId of changesetIds) {
            try {
                if(TFSCommandExecutor.changesetInfo.has(changesetId))
                    continue;

                // Get changeset details
                const historyOutput = await tf([TeamServerCommands.History,
                    Utilities.removeLeadingSlash(fileUri),
                    `/version:C${changesetId}`,
                    TeamServerCommandLineArgs.DetailedFormat]);
                
                // Parse the history output to extract user and date information
                const lines = historyOutput.split('\n');
                let user = '';
                let date = '';
                
                for (const line of lines) {
                    if (line.startsWith('User:')) {
                        user = line.substring(5).trim();
                    } else if (line.startsWith('Date:')) {
                        date = line.substring(5).trim();
                    }

                    if(user != '' && date != '')
                        break;
                }
                
                if (user && date) {
                    TFSCommandExecutor.changesetInfo.set(changesetId, {user, date});
                } else if (user) {
                    // If we only have user info, use an empty string for date
                    TFSCommandExecutor.changesetInfo.set(changesetId, {user, date: ''});
                }
            } catch (error) {
                // If we can't get user information for a changeset, we'll keep the original author info
                console.warn(`Could not get user information for changeset ${changesetId}:`, error);
            }
        }
    }
    
    private parseAnnotateOutput(filePath: string, output: string): BlameResult {
        const lines = output.split('\n');
        const blameInfo: BlameInfo[] = [];
        
        // Parse the annotate output
        // The tfpt annotate format is typically:
        // changesetId author date-time content
        // But we need to handle different formats that might be encountered
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim()) {
                // Try to parse the line with a more flexible approach
                // The format can vary, but typically starts with changeset info
                const trimmedLine = line.trim();
                
                // Common formats:
                // 1. "changesetId author date content"
                // 2. "changesetId author date-time content"
                // 3. "changesetId:author date content"
                
                // Try format 1: "changesetId author date content"
                let match = trimmedLine.match(/^(\d+)\s+([^\s]+)\s+(\d{4}-\d{2}-\d{2})\s+(.*)$/);
                if (match) {
                    const [, changesetIdStr, author, date, content] = match;
                    const changesetId = parseInt(changesetIdStr, 10);
                    
                    blameInfo.push({
                        lineNumber: i + 1,
                        changesetId: changesetId,
                        author: author,
                        date: date,
                        content: content
                    });
                    continue;
                }
                
                // Try format 2: "changesetId author date-time content"
                match = trimmedLine.match(/^(\d+)\s+([^\s]+)\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[\+\-]?\d*:?\d*)\s+(.*)$/);
                if (match) {
                    const [, changesetIdStr, author, date, content] = match;
                    const changesetId = parseInt(changesetIdStr, 10);
                    
                    blameInfo.push({
                        lineNumber: i + 1,
                        changesetId: changesetId,
                        author: author,
                        date: date,
                        content: content
                    });
                    continue;
                }
                
                // Try format 3: "changesetId:author date content"
                match = trimmedLine.match(/^(\d+):([^\s]+)\s+(\d{4}-\d{2}-\d{2})\s+(.*)$/);
                if (match) {
                    const [, changesetIdStr, author, date, content] = match;
                    const changesetId = parseInt(changesetIdStr, 10);
                    
                    blameInfo.push({
                        lineNumber: i + 1,
                        changesetId: changesetId,
                        author: author,
                        date: date,
                        content: content
                    });
                    continue;
                }
                
                // Fallback for any other format - try to extract at least changesetId and author
                const parts = trimmedLine.split(/\s+/);
                if (parts.length >= 2) {
                    // Try to find a changeset ID (number) in the first part
                    const changesetMatch = parts[0].match(/^(\d+)/);
                    if (changesetMatch) {
                        const changesetId = parseInt(changesetMatch[1], 10);
                        const author = parts.length > 1 ? parts[1].split(':')[0] : 'Unknown';
                        const date = parts.length > 2 ? parts[2] : '';
                        const content = parts.length > 3 ? parts.slice(3).join(' ') : '';
                        
                        blameInfo.push({
                            lineNumber: i + 1,
                            changesetId: changesetId,
                            author: author,
                            date: date,
                            content: content
                        });
                    }
                }
            }
        }
        
        return {
            filePath: filePath,
            blameInfo: blameInfo,
            timestamp: new Date()
        };
    }
}
>>>>>>> b5f1d075e6ade18c3604ffd846e00406554efdc3
