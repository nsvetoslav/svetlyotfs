import * as vscode from "vscode"
import { undo } from "./commands/undo"
import { tf } from "./tfs/tfExe"
import { compare_files } from "./commands/compare"
import { pendingChangesProvider } from "./globals"
import { PendingChange } from "./types/pendingChange"
import { TfStatuses } from "./tfs/statuses"
import { checkout } from "./commands/checkout"

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

    
    let nodeitem = pendingChangesProvider.getFileNode(uri);

  let pendingChange = this.fromFileChangeNodeUri(uri);
    if(pendingChange){
      pendingChange = pendingChange as PendingChange;
      let item = {
        propagate: false,
        color: this.color(pendingChange.chg),
				// badge: new vscode.ThemeIcon('close', new vscode.ThemeColor('list.errorForeground'))
        badge: pendingChange.chg.toString().charAt(0)
      }; 
      return item; 
    }
    else if(nodeitem != undefined){
      let item = {
        propagate: false,
        color: this.color(nodeitem.pendingChange.chg),
				// badge: new vscode.ThemeIcon('close', new vscode.ThemeColor('list.errorForeground'))
        badge: nodeitem.pendingChange.chg.toString().charAt(0)   
      };
      return item;
    }

    return undefined;
	}

  color(status: TfStatuses.TfStatus): vscode.ThemeColor {
		let color: string = this.remoteReposColors(status);
		return new vscode.ThemeColor(color);
	}

  remoteReposColors(status: TfStatuses.TfStatus): string  {
		switch (status) {
      case TfStatuses.TfStatus.AddEditEncoding:
				return 'gitDecoration.addedResourceForeground';
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

async function handleFileRename(oldUri: vscode.Uri, newUri: vscode.Uri): Promise<void> {
  // Your code to handle file renaming goes here
  console.log('File will be renamed from:', oldUri.fsPath, 'to:', newUri.fsPath);
}

async function handleFileDeletion(uri: vscode.Uri): Promise<void> {
  // Your code to handle file deletion goes here
  console.log('File will be deleted:', uri.fsPath);
}

async function handleFileCreation(uri: vscode.Uri): Promise<void> {
  // Your code to handle file creation goes here
  console.log('File will be created:', uri.fsPath);
}

export function activate(context: vscode.ExtensionContext): void {
	context.subscriptions.push(new FileTypeDecorationProvider());
  const saveDisposable = vscode.workspace.onWillSaveTextDocument(event => {
    handleOnWillSave(event);
  });

  vscode.workspace.onWillRenameFiles(async (event) => {
  // Create an array to store all promises
    const promises: Promise<void>[] = [];
  
    // Loop through each file in the event
    for (const file of event.files) {
        // Add each async operation to the array
        promises.push(handleFileRename(file.oldUri, file.newUri));
    }

    // Wait until all promises are resolved
    await Promise.all(promises);

    // Cancel the default behavior
    event.waitUntil(Promise.resolve());
  });

  vscode.workspace.onWillDeleteFiles(async (event) => {
  // Create an array to store all promises
    const promises: Promise<void>[] = [];
  
    // Loop through each file in the event
    for (const file of event.files) {
        // Add each async operation to the array
        promises.push(handleFileDeletion(file));
    }

    // Wait until all promises are resolved
    await Promise.all(promises);

    // Cancel the default behavior
    event.waitUntil(Promise.resolve());
  });

  vscode.workspace.onWillCreateFiles(async (event) => {
    // Create an array to store all promises
    const promises: Promise<void>[] = [];
  
    // Loop through each file in the event
    for (const file of event.files) {
        // Add each async operation to the array
        promises.push(handleFileCreation(file));
    }

    // Wait until all promises are resolved
    await Promise.all(promises);

    // Cancel the default behavior
    event.waitUntil(Promise.resolve());
    // Trigger your custom command
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

  // const userResponse = await vscode.window.showInformationMessage(`Do you want to checkout the file: ${event.document.uri.fsPath}?`,
  //   {modal: true},
  //   'Yes',
  //   'No'
  // );

  // if(userResponse === 'Yes'){
    checkout(event.document.uri);
  // } 
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}
