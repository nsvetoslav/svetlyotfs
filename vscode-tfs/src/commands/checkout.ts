import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"
import { pendingChangesProvider } from "../globals"

export async function checkout(uri: vscode.Uri): Promise<void> {
  const task = tf(["checkout", uri.fsPath, "/recursive"])
  await task
  pendingChangesProvider.refresh();
}
