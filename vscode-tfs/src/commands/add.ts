import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"
import { pendingChangesProvider } from "../globals"

export async function add(path: string): Promise<void> {
  console.log(path);
  pendingChangesProvider.refresh();
}
