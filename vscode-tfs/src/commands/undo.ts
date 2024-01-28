import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"

export async function undo(uri: vscode.Uri): Promise<void> {
  const task = tf(["undo", uri.fsPath, "/recursive"])

  vscode.window.setStatusBarMessage("TFS: Undoing...", task)
  await task
  await vscode.commands.executeCommand("workbench.action.files.revert", uri)
  await vscode.window.showInformationMessage(`TFS: Pending changes undone in ${uri.fsPath}`)
}
