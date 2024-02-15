import * as vscode from 'vscode'
import { TeamServer } from '../TeamServer/teamserver';
import { FileNode, PendingChangesSCM } from '../scm/view/pendingchanges';
import * as path from 'path';

export namespace VscodeActionHandlerFunctions {
    export async function renameFiles(files: ReadonlyArray< {
        /**
         * The old uri of a file.
         */
        readonly oldUri: vscode.Uri;
        /**
         * The new uri of a file.
         */
        readonly newUri: vscode.Uri;
    }>) {
        for (const file of files) {
            try {
                await TeamServer.getInstance().rename(file.oldUri, file.newUri);
                await vscode.workspace.fs.copy(file.newUri, file.oldUri);
                await vscode.workspace.fs.delete(file.newUri, {useTrash: true});
                vscode.window.showInformationMessage(`TFS: ${path.basename(file.oldUri.fsPath)} is successfully renamed in version control to ${path.basename(file.newUri.fsPath)}.`);
            } catch (error) {
            }
        }
    }

    export function deleteFiles(files: readonly vscode.Uri[]) : Promise<any> {
        let promises: Promise<any>[] = [];
        for (const file of files) {
            promises.push(TeamServer.getInstance().delete(file))
        }

        return Promise.all(promises);
    }

    export function createFiles(files: readonly vscode.Uri[]) : Promise<any> {
        let promises: Promise<any>[] = [];
        for (const file of files) {
            promises.push(TeamServer.getInstance().add(file))
        }

        return Promise.all(promises);
    }

    export function undo(file: FileNode) {
        return TeamServer.getInstance().undo(file);
    }

    export async function compareFileWithLatest(file: FileNode) {
        return TeamServer.getInstance().compare(file);
    }

    export async function onSaveDocument(file: vscode.Uri) {
        if(await TeamServer.getInstance().checkIsCheckedOut(file) == false){
            return TeamServer.getInstance().checkOut(file);
        }
    }
}