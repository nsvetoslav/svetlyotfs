import * as vscode from "vscode"
import { add } from "./commands/add"
import { checkin } from "./commands/checkin"
import { checkout } from "./commands/checkout"
import { del } from "./commands/delete"
import { get } from "./commands/get"
import { checkoutOnSave, list } from "./commands/list"
import { openInBrowser } from "./commands/openInBrowser"
import { undo } from "./commands/undo"
import { handle } from "./executor"
import { tf } from "./tfs/tfExe"
import { compare_files } from "./commands/compare"
import { pendingChangesProvider } from "./globals"
import { PendingChange } from "./types/pendingChange"
import { TfStatuses } from "./tfs/statuses"

export class FileTypeDecorationProvider implements vscode.FileDecorationProvider {
	private _disposables: vscode.Disposable[] = [];
  constructor() {
		this._disposables.push(vscode.window.registerFileDecorationProvider(this));
	} 
  
fromFileChangeNodeUri(uri: vscode.Uri): PendingChange | undefined {
	try {
		return uri.query ? JSON.parse(uri.query) as PendingChange : undefined;
	} catch (e) { }

  
  return undefined;
}

  onDidChangeFileDecorations?: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> | undefined
	provideFileDecoration(
		uri: vscode.Uri,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.FileDecoration> {

    let pendingChange = this.fromFileChangeNodeUri(uri);
    if(pendingChange){
      pendingChange = pendingChange as PendingChange;
      let item = {
        propagate: false,
        tooltip: "",
        color: this.color(pendingChange.chg),
				// badge: new vscode.ThemeIcon('close', new vscode.ThemeColor('list.errorForeground'))
        badge: pendingChange.chg.toString().charAt(0)
      }; 
      return item; 
    }
    return undefined;
	}

  color(status: TfStatuses.TfStatus): vscode.ThemeColor | undefined {
		let color: string | undefined = this.remoteReposColors(status);
		return new vscode.ThemeColor(color);
	}

  remoteReposColors(status: TfStatuses.TfStatus): string  {
		switch (status) {
			case TfStatuses.TfStatus.Edit:
				return 'gitDecoration.modifiedResourceForeground';
			case TfStatuses.TfStatus.Add:
				return 'gitDecoration.addedResourceForeground';
			case TfStatuses.TfStatus.Delete:
				return 'gitDecoration.deletedResourceForeground';
			case TfStatuses.TfStatus.Rename:
				return 'gitDecoration.renamedResourceForeground';
      default:
        return '';
		}
	}

  dispose() {
    this._disposables.forEach(disposable => {
      disposable.dispose();
    });
	}
}

export function activate(context: vscode.ExtensionContext): void {
	context.subscriptions.push(new FileTypeDecorationProvider());
  const saveDisposable = vscode.workspace.onWillSaveTextDocument(event => {
    handleOnWillSave(event);
  });

  // Make sure to dispose of the event listener when the extension is deactivated
  context.subscriptions.push(saveDisposable);
  vscode.window.registerTreeDataProvider('pendingChanges', pendingChangesProvider);
  vscode.commands.registerCommand('pendingChanges.undo', (path: any) =>
    undo(path.filePath)
  );
  vscode.commands.registerCommand('pendingChanges.compareFiles', (path: any) =>
  compare_files(path.filePath, context.globalStoragePath)
  );
}

export async function checkIsCheckedOut(uri: vscode.Uri) :Promise<string>{
  const task = tf(["status", uri.fsPath]);
  let res = (await task).stdout;
  return res; 
}

async function handleOnWillSave(event: vscode.TextDocumentWillSaveEvent): Promise<void> {
  let res = await checkIsCheckedOut(event.document.uri);
  if(res != 'There are no pending changes.\r\n'){
    return;
  }

  const userResponse = await vscode.window.showInformationMessage(`Do you want to checkout the file: ${event.document.uri.fsPath}?`,
    {modal: true},
    'Yes',
    'No'
  );

  if(userResponse === 'Yes'){
    return vscode.commands.executeCommand('vscode-tfs.checkout', event.document.uri);
  } 
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}
