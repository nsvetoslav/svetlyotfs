import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"
import { pendingChangesProvider, removeLeadingSlash } from "../globals"

export async function add(path: string): Promise<void> {
  await tf(['add', removeLeadingSlash(path)]);
  pendingChangesProvider.refresh();
}
