import * as os from 'os';
import * as vscode from "vscode";
import { undo } from "./commands/undo";
import { compare_files } from "./commands/compare";
import { checkIsCheckedOut, checkout } from "./commands/checkout";
import { rename } from "./commands/rename";
import { del } from "./commands/delete";
import { add } from "./commands/add";
import { Settings } from "./settings/settings";
import { PendingChangesViewDecorationProvider } from "./decorations/pending-changes-view-decoation";
import { pendingChangesProvider } from "./globals";
import { TfStatuses } from "./tfs/statuses";

let tfsWorkspacesStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
    Settings.getInstance().setWorkspaceInfo();
    registerProviders(context);
    registerHandlers(context);
    addTFSWorkspaceStatusBaritem(context);
}

function registerProviders(context: vscode.ExtensionContext) {
  Settings.getInstance().setContext(context);
  context.subscriptions.push(new PendingChangesViewDecorationProvider());
  context.subscriptions.push(vscode.window.registerTreeDataProvider(
    "pendingChanges",
    pendingChangesProvider
  )); /* refresh right after register so items load no matter the view is opened---> */ pendingChangesProvider.refresh();
}

function registerHandlers(context: vscode.ExtensionContext){
  context.subscriptions.push(vscode.workspace.onWillSaveTextDocument((event) => {
    handleOnWillSaveDocument(event);
  }));

  vscode.workspace.onWillRenameFiles(async (event) => {
    let promises: PromiseLike<any>[] = [];
    for (const file of event.files) {
      let fileNode  = pendingChangesProvider.getFileNode(file.oldUri);
      if(fileNode  != undefined){
        if(fileNode.pendingChange.chg=== TfStatuses.TfStatus.Add || fileNode.pendingChange.chg === TfStatuses.TfStatus.AddEditEncoding){
          // TODO implementation 
        }
      }

      const promise = handleFileRename(file.oldUri, file.newUri).then(() => {
          console.log(`TF.exe successfully renamed files from  ${file.oldUri.path} to ${file.newUri.path}.`);
        }).then(async () =>{
          console.log("pre-copying file");
          await vscode.workspace.fs.copy(file.newUri, file.oldUri);
          console.log("pre-deleting file");
          await vscode.workspace.fs.delete(file.newUri, {useTrash: true});
        }).then(() =>{
        }).finally(() => {          
          pendingChangesProvider.refresh();
            
         }).catch((error) => {
          console.log("Error tf.exe - rename files", error);
        });

        promises.push(promise);
    }

    return event.waitUntil(Promise.all(promises));
  });

  vscode.workspace.onWillDeleteFiles(async (event) => {
    const promises: Promise<void>[] = [];
    for (const file of event.files) {
      promises.push(handleFileDeletion(file));
    }
    event.waitUntil(Promise.all(promises));
  });

  vscode.workspace.onWillCreateFiles(async (event) => {
    const promises: Promise<void>[] = [];

    for (const file of event.files) {
      promises.push(handleFileCreation(file));
    }

    event.waitUntil(Promise.all(promises));
  });

  vscode.commands.registerCommand("pendingChanges.undo", (path: any) =>
    undo(path.filePath)
  );
  vscode.commands.registerCommand("pendingChanges.compareFiles", (path: any) =>
    compare_files(path.filePath, os.homedir())
  );
  vscode.commands.registerCommand("pendingChanges.workspace", () => {
    showTFSWorkspacesQuickPick();
  });
}

function addTFSWorkspaceStatusBaritem(context: vscode.ExtensionContext) {

  vscode.commands.registerCommand("showQuickPick", () =>{
    showTFSWorkspacesQuickPick();
  });

	context.subscriptions.push(vscode.commands.registerCommand('tfs.showWorkspaces', () => {
    showTFSWorkspacesQuickPick();
	}));

	tfsWorkspacesStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	tfsWorkspacesStatusBarItem.command = 'tfs.showWorkspaces';

  context.subscriptions.push(tfsWorkspacesStatusBarItem);
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateTFSWorkspacesStatusBarItem));
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateTFSWorkspacesStatusBarItem));
	updateTFSWorkspacesStatusBarItem();
}

async function showTFSWorkspacesQuickPick() {
  let quickpickOptions : vscode.QuickPickOptions = {
    placeHolder: "Choose workspace"    
  } 

  let activeWs = Settings.getInstance().getActiveTfsWorkspace<string>();
  if(activeWs != undefined && (activeWs as string).length > 0){
    quickpickOptions.placeHolder = (`Current: ${(activeWs as string)}`);
    Settings.getInstance().getWorkspaceInfo().workspaces.sort((a: string, b: string ) => {
      console.log(a,b);
      const activews = (activeWs as unknown);
      if(a === (activews as string)){
        return -1;
      }
      return 0;
    })
  }

  const selected = await vscode.window.showQuickPick(Settings.getInstance().getWorkspaceInfo().workspaces, quickpickOptions);
  if(selected){
    Settings.getInstance().setActiveTfsWorkspace(selected.toString());    
  }
}

function handleFileRename(
  oldUri: vscode.Uri,
  newUri: vscode.Uri
) : Promise<{ stdout: string; stderr: string }>{
  return rename(oldUri.path, newUri.path);
}

async function handleFileDeletion(uri: vscode.Uri): Promise<void> {
  del(uri);
}

async function handleFileCreation(uri: vscode.Uri): Promise<void> {
  add(uri.path);
}

async function handleOnWillSaveDocument(
  event: vscode.TextDocumentWillSaveEvent
): Promise<void> {
  let res = await checkIsCheckedOut(event.document.uri);
  if (res != "There are no pending changes.\r\n") {
    return;
  }
  checkout(event.document.uri);
}

function updateTFSWorkspacesStatusBarItem(): void {
  tfsWorkspacesStatusBarItem.text = `[TFS]: Workspaces`;
  tfsWorkspacesStatusBarItem.tooltip = "Change your TFS workspace";
  tfsWorkspacesStatusBarItem.show();
  pendingChangesProvider.refresh();
}

export function deactivate(): void {}
