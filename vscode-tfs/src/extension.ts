import * as vscode from "vscode";
import { undo } from "./commands/undo";
import { tf } from "./tfs/tfExe";
import { compare_files } from "./commands/compare";
import { checkout } from "./commands/checkout";
import { rename } from "./commands/rename";
import { del } from "./commands/delete";
import { add } from "./commands/add";
import * as os from 'os';
import { WorkspaceInfo, get_workspaces } from "./commands/additional";
import { Settings } from "./settings/settings";
import { PendingChangesViewDecorationProvider } from "./views/decorations/pending-changes-view-decoation";
import { pendingChangesProvider } from "./globals";
import { TfStatuses } from "./tfs/statuses";

let workspacesStatusBarItem: vscode.StatusBarItem;

let workspaceSettings : WorkspaceInfo;
let settings : Settings;

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

export function activate(context: vscode.ExtensionContext): void {
  settings = new Settings(context);
    get_workspaces().then((setting) => {
    if(setting.workspaces.length > 0){
      if(settings.getActiveTfsWorkspace() === undefined){
        settings.setActiveTfsWorkspace(setting.workspaces[0]);
      }
      workspaceSettings = setting;
    }
    }).catch((error) => {
      console.log("Error setting default TFS workspace.", error);
    });
  
  let decorationprovider = new PendingChangesViewDecorationProvider();
  context.subscriptions.push(decorationprovider);
  const saveDisposable = vscode.workspace.onWillSaveTextDocument((event) => {
    handleOnWillSave(event);
  });
  context.subscriptions.push(saveDisposable);

  vscode.window.registerTreeDataProvider(
    "pendingChanges",
    pendingChangesProvider
  );
  
  pendingChangesProvider.refresh();

  vscode.commands.registerCommand("showQuickPick", () =>{
    showQuickPick();
  }
  );

	const myCommandId = 'tfs.showWorkspaces';
	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
    showQuickPick();
	}));

	workspacesStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	workspacesStatusBarItem.command = myCommandId;
	context.subscriptions.push(workspacesStatusBarItem);

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateWorkspacesStatusBarItem));
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateWorkspacesStatusBarItem));
	updateWorkspacesStatusBarItem();

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

  // vscode.workspace.onDidRenameFiles( async (event) => {
  //   event.files.forEach(file => {
  //     let pgItem  = decorationprovider.fromFileChangeNodeUri(file.oldUri); 
  //     if(pgItem != undefined && pgItem.chg != TfStatuses.TfStatus.Edit){
  //       if(pgItem.chg == TfStatuses.TfStatus.Add){
  //         undo(file.oldUri.path);
  //         add(file.newUri.path);
  //         pendingChangesProvider.refresh();
  //       }
  //     }
  //   });
  // })

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
    showQuickPick();
  });
}

async function showQuickPick() {
  let quickpickOptions : vscode.QuickPickOptions = {
    placeHolder: "Choose workspace"    
  } 

  let activeWs = settings.getActiveTfsWorkspace<string>();
  if(activeWs != undefined && (activeWs as string).length > 0){
    quickpickOptions.placeHolder = (`Current: ${(activeWs as string)}`);
    workspaceSettings.workspaces.sort((a: string, b: string ) => {
      console.log(a,b);
      const activews = (activeWs as unknown);
      if(a === (activews as string)){
        return -1;
      }
      return 0;
    })
  }

  const selected = await vscode.window.showQuickPick(workspaceSettings.workspaces, quickpickOptions);
  if(selected){
    settings.setActiveTfsWorkspace(selected.toString());    
  }
}

export async function  checkIsCheckedOut(uri: vscode.Uri): Promise<string> {
  const task = tf(["status", uri.fsPath]);
  let res = (await task).stdout;
  return res;
}

async function handleOnWillSave(
  event: vscode.TextDocumentWillSaveEvent
): Promise<void> {
  let res = await checkIsCheckedOut(event.document.uri);
  if (res != "There are no pending changes.\r\n") {
    return;
  }

  checkout(event.document.uri);
}

export function deactivate(): void {}


function updateWorkspacesStatusBarItem(): void {
  workspacesStatusBarItem.text = `[TFS]: Workspaces`;
  workspacesStatusBarItem.tooltip = "Change your TFS workspace";
  workspacesStatusBarItem.show();
  pendingChangesProvider.refresh();
}
