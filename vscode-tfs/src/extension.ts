import * as vscode from "vscode";
import path from "path";
import { ActionHandlers } from "./vscode/ActionHandlers";
import { WorkspacesStatusBarItem } from "./vscode/WorkspaceStatusBarItem";
import { FileHistoryTreeView } from "./vscode/FileHistoryTreeView";
import { Changeset } from "./TFS/Types";
import { PendingChangesTreeView } from "./vscode/PendingChangesTreeView";
import { PendingChangesViewDecoration } from "./vscode/PendingChangesViewDecoration";
import { BlameManager } from "./TFS/BlameManager";
import { BlameDecorationsProvider } from "./vscode/BlameDecorationsProvider";
import { Settings } from "./common/Settings";
import { Utilities } from "./common/Utilities";
import { testAnnotateCommand } from "./test/annotateTest";
import { runBlameIntegrationTest } from "./test/blameIntegrationTest";

let treeview: any;

export function activate(context: vscode.ExtensionContext): void {
    Settings.getInstance().setWorkspaceInfo();
    registerProviders(context);
    registerHandlers(context);
    addWorkspaceStatusBarItem(context);
}

function registerProviders(context: vscode.ExtensionContext) {
  Settings.getInstance().setContext(context);
 
  context.subscriptions.push(new PendingChangesViewDecoration());
  context.subscriptions.push(vscode.window.createTreeView("pendingChanges", {
    treeDataProvider: PendingChangesTreeView.getInstance(),
    canSelectMany: true,
  }));

  context.subscriptions.push( treeview = vscode.window.createTreeView("currentFileHistory", {
    treeDataProvider: FileHistoryTreeView.getInstance(),
    canSelectMany: true,
  }));
  
  PendingChangesTreeView.getInstance().refresh();
}

function registerHandlers(context: vscode.ExtensionContext){
  // Save document
  context.subscriptions.push(vscode.workspace.onWillSaveTextDocument( async (event) => {
    return await ActionHandlers.onSaveDocument(event.document.uri)
  }));

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async () => {
    return await PendingChangesTreeView.getInstance().refresh();
  }))

  // Rename files
  context.subscriptions.push(vscode.workspace.onDidRenameFiles(async (event) => {
    await ActionHandlers.renameFiles(event.files);
    return await PendingChangesTreeView.getInstance().refresh();
  }));

  // Delete files
  context.subscriptions.push(vscode.workspace.onWillDeleteFiles(async (event) => { 
    return await event.waitUntil(ActionHandlers.deleteFiles(event.files));
  }));

  context.subscriptions.push(vscode.workspace.onDidDeleteFiles(async () => {
    return await PendingChangesTreeView.getInstance().refresh();
  }));

  // Create files
  context.subscriptions.push(vscode.workspace.onDidCreateFiles(async (event) => {
    await ActionHandlers.createFiles(event.files);
    return await PendingChangesTreeView.getInstance().refresh();
  }));

  // Commands registration
  context.subscriptions.push(vscode.commands.registerCommand("pendingChanges.undo", async (uri: any) => {
    await ActionHandlers.undo(uri);
    return await PendingChangesTreeView.getInstance().refresh();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('fileHistory.comapreWithAnother', async () =>{
    let changesets: Changeset[] = [];

    treeview.selection.forEach((item: { data: any; }) => {
      const queryObject = JSON.parse((item as any).resourceUri.query as any)
      console.log(queryObject);

      changesets.push(queryObject as Changeset);
    });

    if(changesets.length != 2 || changesets === undefined) {
      return;
    }

    await ActionHandlers.compareFilesFromHistory(vscode.Uri.parse(changesets[0].items[0]),
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

    const fileHistory = await ActionHandlers.onOpenDocument(event.document.uri);
    FileHistoryTreeView.getInstance().refresh(fileHistory as any);
  }))
  
  vscode.commands.registerCommand("pendingChanges.compareFiles", async (uri: any) => {
    return await ActionHandlers.compareFileWithLatest(uri)
  });
  
  // Test annotate command
  context.subscriptions.push(vscode.commands.registerCommand("vscode-tfs.testAnnotate", async () => {
    return await testAnnotateCommand();
  }));
  
  // Test blame integration
  context.subscriptions.push(vscode.commands.registerCommand("vscode-tfs.testBlameIntegration", async () => {
    return await runBlameIntegrationTest();
  }));
  
  // Show blame information for a file
  context.subscriptions.push(vscode.commands.registerCommand("vscode-tfs.showBlame", async () => {
    // Get the active text editor's document
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No active editor to show blame information for.");
      return;
    }
    
    const resource = editor.document.uri;
    const decorationsProvider = BlameDecorationsProvider.getInstance();
    
    // Show loading indicator
    decorationsProvider.showLoadingIndicator(editor);
    
    // Get blame information for the file
    try {
      const blameManager = BlameManager.getInstance();
      const blameResult = await blameManager.getFileBlame(resource);
      
      // Hide loading indicator
      decorationsProvider.hideLoadingIndicator();
      
      if (blameResult) {
        // Show the blame information as decorations
        decorationsProvider.showBlameInformation(editor, blameResult);
        
        vscode.window.showInformationMessage(`Blame information displayed for ${resource.fsPath}`);
      } else {
        vscode.window.showErrorMessage(`Could not get blame information for ${resource.fsPath}`);
      }
    } catch (error: any) {
      // Hide loading indicator in case of error
      decorationsProvider.hideLoadingIndicator();
      vscode.window.showErrorMessage(`Error getting blame information: ${error.message}`);
      console.error("Error getting blame information:", error);
    }
  }));
  
  // Blame functionality - now only available via context menu
  // Removed automatic blame loading on file open
}

function addWorkspaceStatusBarItem(context: vscode.ExtensionContext) {
  context.subscriptions.push(WorkspacesStatusBarItem.getInstance().getStatusBarItem());
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(WorkspacesStatusBarItem.getInstance().update));
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(WorkspacesStatusBarItem.getInstance().update));
  WorkspacesStatusBarItem.getInstance().registerTriggerCommand();
}

export function deactivate(): void {}
