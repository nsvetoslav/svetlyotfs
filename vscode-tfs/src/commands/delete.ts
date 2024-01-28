import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"

export async function del(uri: vscode.Uri): Promise<void> {
  const task = tf(["delete", uri.fsPath, "/recursive"])

  vscode.window.setStatusBarMessage("TFS: Deleting...", task)
  await task
  await vscode.window.showInformationMessage(`TFS: ${uri.fsPath} successfully deleted from version control.`)
}
