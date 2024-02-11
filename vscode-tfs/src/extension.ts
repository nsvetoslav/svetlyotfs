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
import { pendingChangesProvider } from "./views/globals";
import { PendingChangesViewDecorationProvider } from "./views/decorations/pending-changes-view-decoation";
1
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
  if(settings.getActiveTfsWorkspace() === undefined){
    get_workspaces().then((setting) => {
    if(setting.workspaces.length > 0){
      settings.setActiveTfsWorkspace(setting.workspaces[0]);
      workspaceSettings = setting;
    }
    }).catch((error) => {
      console.log("Error setting default TFS workspace.", error);
    });
  }
  
  context.subscriptions.push(new PendingChangesViewDecorationProvider());
  const saveDisposable = vscode.workspace.onWillSaveTextDocument((event) => {
    handleOnWillSave(event);
  });
  context.subscriptions.push(saveDisposable);

  vscode.workspace.onWillRenameFiles((event) => {
    let promises: Promise<any>[] = [];
    for (const file of event.files) {
        const promise = handleFileRename(file.oldUri, file.newUri).then(() => {
          console.log(`TF.exe successfully renamed files from  ${file.oldUri.path} to ${file.newUri.path}.`);
        }).finally(() => {
          console.log("Peparing file deletion: ", file.newUri.path);
          vscode.workspace.fs.delete(file.newUri).then(() =>{
          console.log("Successfully deleted file: ", file.newUri.path);  
          });
        }).catch((error) => {
          console.log("Error tf.exe - rename files", error);
        });

        promises.push(promise);
    }

    return event.waitUntil(Promise.all(promises));
  });

  vscode.workspace.onDidRenameFiles( async (event) => {
    console.log("File renamed from ", event.files[0].oldUri.path, "to ", event.files[0].newUri.path);
  })

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

  vscode.window.registerTreeDataProvider(
    "pendingChanges",
    pendingChangesProvider
  );
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
  const selected = await vscode.window.showQuickPick(workspaceSettings.workspaces, quickpickOptions);
  if(selected){
    settings.setActiveTfsWorkspace(selected.toString());    
  }
}

export async function checkIsCheckedOut(uri: vscode.Uri): Promise<string> {
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
