import * as vscode from 'vscode'
import { TeamServer } from '../TeamServer/teamserver';
import { PendingChangesSCM } from '../scm/view/pendingchanges';

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
            const fileNode = PendingChangesSCM.getInstance().getFileNode(file.oldUri);
            if(fileNode === undefined) {
                continue;
            }        

            try {
                await TeamServer.getInstance().rename(file.oldUri, file.newUri);
                await vscode.workspace.fs.copy(file.newUri, file.oldUri);
                await vscode.workspace.fs.delete(file.newUri, {useTrash: true});
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

    export function undo(file: vscode.Uri) {
        return TeamServer.getInstance().undo(file);
    }

    export async function compareFileWithLatest(file: vscode.Uri) {
        return TeamServer.getInstance().compare(file);
    }

    export async function onSaveDocument(file: vscode.Uri) {
        if(await TeamServer.getInstance().checkIsCheckedOut(file) == false){
            return TeamServer.getInstance().checkOut(file);
        }
    }
}