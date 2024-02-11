import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"
import { pendingChangesProvider } from "../globals"

export async function checkIsCheckedOut(uri: vscode.Uri): Promise<string> {
  const task = tf(["status", uri.fsPath]);
  let res = (await task).stdout;
  return res;
}

export async function checkout(uri: vscode.Uri): Promise<void> {
  const task = tf(["checkout", uri.fsPath, "/recursive"])
  await task
  pendingChangesProvider.refresh();
}
