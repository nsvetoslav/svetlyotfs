import * as vscode from "vscode";
import { Settings } from "./settings/settings";
import { VscodeActionHandlerFunctions } from './handlers/handlers';
import { PendingChangesViewDecorationProvider } from "./scm/decorations/viewdecoration";
import { PendingChangesSCM } from "./scm/view/pendingchanges";
import { WorkspacesStatusBarItem } from "./controls/statusbar/workspaces";

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
