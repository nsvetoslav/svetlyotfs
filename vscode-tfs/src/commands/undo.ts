import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"
import { pendingChangesProvider } from "../views/globals";

export async function undo(uri: string): Promise<void> {
  const task = tf(["undo", uri, "/recursive"])
  await task
  pendingChangesProvider.refresh();
}
