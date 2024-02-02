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
import { PendingChangesProvider } from "./views/pending_changes_view"
import { pendingChangesProvider } from "./view/var"
import { tf } from "./tfs/tfExe"
import { dirStatus } from "./commands/dirStatus"

export const commands = [
  { command: "vscode-tfs.get", handler: handle(get) },
  { command: "vscode-tfs.checkout", handler: handle(checkout) },
  { command: "vscode-tfs.checkin", handler: handle(checkin) },
  { command: "vscode-tfs.add", handler: handle(add) },
  { command: "vscode-tfs.delete", handler: handle(del) },
  { command: "vscode-tfs.undo", handler: handle(undo) },
  { command: "vscode-tfs.openInBrowser", handler: handle(openInBrowser) },
  { command: "vscode-tfs.list", handler: handle(list) },
  { command : "vscode-tfs.checkoutOnSave", handler: handle(checkoutOnSave)}
]

export function activate(context: vscode.ExtensionContext): void {
  try {
   
  for (const desc of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(desc.command, desc.handler))
  }

  const rootPath =
    vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : "";

  const nodeDependenciesProvider = new PendingChangesProvider(rootPath as string);
  
  vscode.window.registerTreeDataProvider('pendingChanges', nodeDependenciesProvider);
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
