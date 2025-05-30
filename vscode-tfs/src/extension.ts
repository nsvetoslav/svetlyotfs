import * as vscode from "vscode";
import path from "path";
import { VscodeActionHandlerFunctions } from "./handlers";
import { PendingChangesSCM } from "./pendingchanges";
import { WorkspacesStatusBarItem } from "./workspaces";
import { TfTypes } from "./types";
import { Utilities } from "./utils";
import { FileHistorySCM } from "./fileHistorySCM";
import { Settings } from "./settings";
import { PendingChangesViewDecorationProvider } from "./viewDecoration";

let treeview: any;

export function activate(context: vscode.ExtensionContext): void {
    Settings.getInstance().setWorkspaceInfo();
    registerProviders(context);
    registerHandlers(context);
    addWorkspaceStatusBarItem(context);
}

function registerProviders(context: vscode.ExtensionContext) {
  Settings.getInstance().setContext(context);
 
  context.subscriptions.push(new PendingChangesViewDecorationProvider());
  context.subscriptions.push(vscode.window.createTreeView("pendingChanges", {
    treeDataProvider: PendingChangesSCM.getInstance(),
    canSelectMany: true,
  }));

  context.subscriptions.push( treeview = vscode.window.createTreeView("currentFileHistory", {
    treeDataProvider: FileHistorySCM.getInstance(),
    canSelectMany: true,
  }));
  
  PendingChangesSCM.getInstance().refresh();
}

function registerHandlers(context: vscode.ExtensionContext){
  // Save document
  context.subscriptions.push(vscode.workspace.onWillSaveTextDocument( async (event) => {
    return await VscodeActionHandlerFunctions.onSaveDocument(event.document.uri)
  }));

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async () => {
    return await PendingChangesSCM.getInstance().refresh();
  }))

  // Rename files
  context.subscriptions.push(vscode.workspace.onDidRenameFiles(async (event) => {
    await VscodeActionHandlerFunctions.renameFiles(event.files);
    return await PendingChangesSCM.getInstance().refresh();
  }));

  // Delete files
  context.subscriptions.push(vscode.workspace.onWillDeleteFiles(async (event) => { 
    return await event.waitUntil(VscodeActionHandlerFunctions.deleteFiles(event.files));
  }));

  context.subscriptions.push(vscode.workspace.onDidDeleteFiles(async () => {
    return await PendingChangesSCM.getInstance().refresh();
  }));

  // Create files
  context.subscriptions.push(vscode.workspace.onDidCreateFiles(async (event) => {
    await VscodeActionHandlerFunctions.createFiles(event.files);
    return await PendingChangesSCM.getInstance().refresh();
  }));

  // Commands registration
  context.subscriptions.push(vscode.commands.registerCommand("pendingChanges.undo", async (uri: any) => {
    await VscodeActionHandlerFunctions.undo(uri);
    return await PendingChangesSCM.getInstance().refresh();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('fileHistory.comapreWithAnother', async () =>{
    let changesets: TfTypes.Changeset[] = [];

    treeview.selection.forEach((item: { data: any; }) => {
      const queryObject = JSON.parse((item as any).resourceUri.query as any)
      console.log(queryObject);

      changesets.push(queryObject as TfTypes.Changeset);
    });

    if(changesets.length != 2 || changesets === undefined) {
      return;
    }

    await VscodeActionHandlerFunctions.compareFilesFromHistory(vscode.Uri.parse(changesets[0].items[0]),
      changesets[0].changesetId.toString(),
      changesets[0].user as string,
      changesets[1].changesetId.toString(),
      changesets[1].user as string,
      );

    console.log(changesets);
  }));

  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(async (event) => {
    const workspaceDirectory = Utilities.getWorkspaceDirectory();
    if(workspaceDirectory === '')
      return;

    if(!event)
      return;

    if(path.basename(workspaceDirectory) != vscode.workspace.getWorkspaceFolder(event.document.uri)?.name) {
      return;
    }

    const fileHistory = await VscodeActionHandlerFunctions.onOpenDocument(event.document.uri);
    FileHistorySCM.getInstance().refresh(fileHistory as any);
  }))
  
  vscode.commands.registerCommand("pendingChanges.compareFiles", async (uri: any) => {
    return await VscodeActionHandlerFunctions.compareFileWithLatest(uri)
  });
}

function addWorkspaceStatusBarItem(context: vscode.ExtensionContext) {
  context.subscriptions.push(WorkspacesStatusBarItem.getInstance().getStatusBarItem());
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(WorkspacesStatusBarItem.getInstance().update));
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(WorkspacesStatusBarItem.getInstance().update));
  WorkspacesStatusBarItem.getInstance().registerTriggerCommand();
}

export function deactivate(): void {}
