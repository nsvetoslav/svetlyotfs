import * as vscode from "vscode";
import { Settings } from "./settings/settings";
import { VscodeActionHandlerFunctions } from './Handlers/handlers';
import { PendingChangesViewDecorationProvider } from "./scm/decorations/viewdecoration";
import { PendingChangesSCM } from "./scm/view/pendingchanges";

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
    PendingChangesSCM.getInstance()
  ));

  PendingChangesSCM.getInstance().refresh();
}

function registerHandlers(context: vscode.ExtensionContext){
  context.subscriptions.push(vscode.workspace.onWillSaveTextDocument( async (event) => {
    return await VscodeActionHandlerFunctions.onSaveDocument(event.document.uri)
  }));

  vscode.workspace.onWillRenameFiles(async (event) => {
    return await event.waitUntil(VscodeActionHandlerFunctions.renameFiles(event.files));
  });

  vscode.workspace.onWillDeleteFiles(async (event) => { 
    return await event.waitUntil(VscodeActionHandlerFunctions.deleteFiles(event.files));
  });

  vscode.workspace.onWillCreateFiles(async (event) => {
    return await event.waitUntil(VscodeActionHandlerFunctions.createFiles(event.files));
  });

  vscode.commands.registerCommand("pendingChanges.undo", async (uri: any) => {
    return await VscodeActionHandlerFunctions.undo(uri);
  });
  
  vscode.commands.registerCommand("pendingChanges.compareFiles", async (uri: any) => {
    return await VscodeActionHandlerFunctions.compareFileWithLatest(uri)
  });

  vscode.commands.registerCommand("pendingChanges.workspace", async () => {
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

function updateTFSWorkspacesStatusBarItem(): void {
  tfsWorkspacesStatusBarItem.text = `[TFS]: Workspaces`;
  tfsWorkspacesStatusBarItem.tooltip = "Change your TFS workspace";
  tfsWorkspacesStatusBarItem.show();
  PendingChangesSCM.getInstance().refresh();
}

export function deactivate(): void {}
