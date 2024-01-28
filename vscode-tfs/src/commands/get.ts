import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"

export async function get(uri: vscode.Uri): Promise<void> {
  const task = tf(["get", uri.fsPath, "/recursive"])

  vscode.window.setStatusBarMessage("TFS: Getting latest version...", task)
  await task

  const messageTask = vscode.window.showInformationMessage(`TFS: ${uri.fsPath} files updated to the latest version.`)
  vscode.window.setStatusBarMessage("TFS: Get Latest Version successful.", messageTask)
  await messageTask
}
