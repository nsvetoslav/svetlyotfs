import * as vscode from "vscode"
import * as path from 'path'
import * as fs from 'fs'
import { tf } from "./Spawn";
import { WorkspaceInfo } from "./Types";
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
}