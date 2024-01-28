import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"

export async function checkout(uri: vscode.Uri): Promise<void> {
  const task = tf(["checkout", uri.fsPath, "/recursive"])

  vscode.window.setStatusBarMessage("TFS: Checking...", task)
  await task
  await vscode.window.showInformationMessage(`TFS: ${uri.fsPath} successfully checked out for editing.`)
}
