import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"

export async function get(uri: vscode.Uri): Promise<void> {
  const task = tf(["get", uri.fsPath, "/recursive"])
  await task
}
