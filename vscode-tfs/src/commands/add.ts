import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"

export async function add(uri: vscode.Uri): Promise<void> {
  const task = tf(["add", uri.fsPath, "/recursive"])

  vscode.window.setStatusBarMessage("TFS: Adding...", task)
  await task
  await vscode.window.showInformationMessage(`TFS: ${uri.fsPath} successfully added to version control.`)
}
