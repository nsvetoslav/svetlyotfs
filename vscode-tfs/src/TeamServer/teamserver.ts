import * as vscode from "vscode"
import * as path from 'path'
import * as fs from 'fs'

import { tf } from "../tfs/tfExe";

import { FileNode } from "../scm/view/pendingchanges";
import { Utilities } from "./utils";
import { TfTypes } from "./types";

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
}

enum TeamServerCommandLineArgs {
    Recursive = "/recursive",
    OutputDirectory = "/output",
    XmlFormat = "/format:xml"
}

export class TeamServer {
    private static instance: TeamServer;
    private constructor() { }

    public static getInstance(): TeamServer {
        if (!TeamServer.instance) {
            TeamServer.instance = new TeamServer();
        }

        return TeamServer.instance;
    }

    public async add(uri: vscode.Uri) {
        try{
            await tf([TeamServerCommands.Add, Utilities.removeLeadingSlash(uri)]);
            vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} succesfully added in version control.`);
        } catch(error: any) {
            vscode.window.showErrorMessage(`TFS: Adding ${path.basename(uri.fsPath)} in version control failed. Error: ${error.message}.`);
        } 
    }

    public async checkIn(uri: vscode.Uri) {
        try {
            await tf([TeamServerCommands.CheckIn, Utilities.removeLeadingSlash(uri), TeamServerCommandLineArgs.Recursive])
            vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} succesfully checked in version control.`);
        } catch (error: any) {
            vscode.window.showErrorMessage(`TFS: Checking ${path.basename(uri.fsPath)} in version control failed. Error: ${error.message}.`);
        } 
    }

    public async checkOut(uri: vscode.Uri) {
        try {
            await tf([TeamServerCommands.CheckOut, Utilities.removeLeadingSlash(uri), TeamServerCommandLineArgs.Recursive])
            vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} succesfully checked out in version control.`);
        } catch (error: any) {
            vscode.window.showErrorMessage(`TFS: Checking out ${path.basename(uri.fsPath)} in version control failed. Error: ${error.message}.`);
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
            vscode.window.showErrorMessage(`TFS: Comparing ${path.basename(localUri.filePath)} with latest failed. Error: ${error.message}.`);
        }
    }

    public async delete(uri: vscode.Uri) {
        try{
            await tf([TeamServerCommands.Delete, Utilities.removeLeadingSlash(uri), TeamServerCommandLineArgs.Recursive]);
            vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} succesfully deleted from version control.`);
        } catch(error: any) {
            vscode.window.showErrorMessage(`TFS: Deleting ${path.basename(uri.fsPath)} failed. Error: ${error.message}.`);
        } 
    }

    public async get(uri: vscode.Uri) {
        try{
            await tf([TeamServerCommands.Get, Utilities.removeLeadingSlash(uri), TeamServerCommandLineArgs.Recursive]);
            vscode.window.showInformationMessage(`TFS: ${path.basename(uri.fsPath)} is now latest.`);
        } catch(error: any) {
            vscode.window.showErrorMessage(`TFS: Getting ${path.basename(uri.fsPath)} failed. Error: ${error.message}.`);
        } 
    }

    public async rename(oldUri: vscode.Uri, newUri: vscode.Uri) {
        return tf([TeamServerCommands.Rename, Utilities.removeLeadingSlash(oldUri), Utilities.removeLastDirectory(Utilities.removeLeadingSlash(newUri))]);
    }

    public async status(uri: vscode.Uri) {
        let tfTask;

        try {
            tfTask = await tf([TeamServerCommands.Status, 
                TeamServerCommandLineArgs.Recursive,
                TeamServerCommandLineArgs.XmlFormat,
                `${Utilities.removeLeadingSlash(uri)}`]);

                return await Utilities.tfsStatusXmlToTypedArray(tfTask);
        } catch (error: any) {
            vscode.window.showErrorMessage(`TFS": Getting workspace files status from version control failed. Error ${error.message}}`)
        }

        return undefined;
    }

    public async undo(uri: FileNode) {
        try{
            await tf([TeamServerCommands.Undo, uri.filePath, TeamServerCommandLineArgs.Recursive]);
            vscode.window.showInformationMessage(`TFS: Undoing changes in version control for ${path.basename(uri.filePath)} completed successfully.`);
        } catch(error: any) {
            vscode.window.showErrorMessage(`TFS: Undoing changes for ${path.basename(uri.filePath)} failed. Error: ${error.message}.`);
        } 
    }

    public async getWorkspaces() {
        let task;
        try {
            task = await tf([TeamServerCommands.Workspaces])
            const splittedConnectionsOutput = task.split('\n');
            const workspaceInfo: TfTypes.WorkspaceInfo = {
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
            vscode.window.showErrorMessage(`TFS: Retrieving workspaces from version control failed: Error ${error.message}`)
        } 

        return undefined;
    }

    public async checkIsCheckedOut(uri: vscode.Uri) {
        try {
            const task = await tf([TeamServerCommands.Status, Utilities.removeLeadingSlash(uri)]);
            if (task != 'There are no pending changes.\r\n') {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
}