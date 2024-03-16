import * as vscode from 'vscode'
import { TeamServer } from '../teamserver/teamserver';
import { FileNode, PendingChangesSCM } from '../scm/view/pendingchanges';
import * as path from 'path';

export namespace VscodeActionHandlerFunctions {
    export async function renameFiles(files: ReadonlyArray<{
        readonly oldUri: vscode.Uri;
        readonly newUri: vscode.Uri;
    }>) {
        for (const file of files) {
            try {
                await TeamServer.getInstance().rename(file.oldUri, file.newUri);
            } catch (error:any ) {
                vscode.window.showErrorMessage(`TFS: Renaming ${path.basename(file.oldUri.fsPath)} to ${path.basename(file.newUri.fsPath)} in version control failed. Error: ${error.message}.`);
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

    export async function compareFilesFromHistory(uri: vscode.Uri, changeset1: string, changedBy1: string, changeset2: string, changedBy2: string,) {
        return TeamServer.getInstance().compareFilesFromHistory(uri, changeset1, changedBy1, changeset2, changedBy2);
    }

    export async function compareFileWithLatest(file: FileNode) {
        return TeamServer.getInstance().compare(file);
    }

    export async function onSaveDocument(file: vscode.Uri) {
        if(await TeamServer.getInstance().checkIsCheckedOut(file) == false){
            return TeamServer.getInstance().checkOut(file);
        }
    }

    export async function onOpenDocument(file: vscode.Uri) {
        return await TeamServer.getInstance().fileHistory(file);
    }
}