import * as vscode from 'vscode'
import * as path from 'path';
import { TFSCommandExecutor } from '../TFS/Commands';
import { FileNode } from './PendingChangesTreeView';

export namespace ActionHandlers {
    export async function renameFiles(files: ReadonlyArray<{
        readonly oldUri: vscode.Uri;
        readonly newUri: vscode.Uri;
    }>) {
        for (const file of files) {
            try {
                await TFSCommandExecutor.getInstance().rename(file.oldUri, file.newUri);
            } catch (error:any ) {
                vscode.window.showErrorMessage(`TFS: Renaming ${path.basename(file.oldUri.fsPath)} to ${path.basename(file.newUri.fsPath)} in version control failed. Error: ${error.message}.`);
            }
        }
    }

    export function deleteFiles(files: readonly vscode.Uri[]) : Promise<any> {
        let promises: Promise<any>[] = [];
        for (const file of files) {
            promises.push(TFSCommandExecutor.getInstance().delete(file))
        }

        return Promise.all(promises);
    }

    export function createFiles(files: readonly vscode.Uri[]) : Promise<any> {
        let promises: Promise<any>[] = [];
        for (const file of files) {
            promises.push(TFSCommandExecutor.getInstance().add(file))
        }

        return Promise.all(promises);
    }

    export function undo(file: FileNode) {
        return TFSCommandExecutor.getInstance().undo(file);
    }

    export async function compareFilesFromHistory(uri: vscode.Uri, changeset1: string, changedBy1: string, changeset2: string, changedBy2: string,) {
        return TFSCommandExecutor.getInstance().compareFilesFromHistory(uri, changeset1, changedBy1, changeset2, changedBy2);
    }

    export async function compareFileWithLatest(file: FileNode) {
        return TFSCommandExecutor.getInstance().compare(file);
    }

    export async function onSaveDocument(file: vscode.Uri) {
        if(await TFSCommandExecutor.getInstance().checkIsCheckedOut(file) == false){
            return TFSCommandExecutor.getInstance().checkOut(file);
        }
    }

    export async function onOpenDocument(file: vscode.Uri) {
        return await TFSCommandExecutor.getInstance().fileHistory(file);
    }
}