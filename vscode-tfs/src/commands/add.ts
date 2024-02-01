import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"
import { pendingChangesProvider } from "../view/var"

export async function add(uri: vscode.Uri): Promise<void> {
  console.log(uri);
  pendingChangesProvider.refresh();
}
