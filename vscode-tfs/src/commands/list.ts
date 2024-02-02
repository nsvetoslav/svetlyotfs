import * as vscode from "vscode"
import packageJson from "../../package.json"

const excludedCommands = ["vscode-tfs.list"]

export async function list(uri: vscode.Uri): Promise<void> {
  const commands: Array<Command> = packageJson.contributes.commands
  const menuItems = commands
    .filter((desc) => !excludedCommands.includes(desc.command))
    .map(({ title, detail, command }) => ({ label: title, detail, command }))

  const selectedItem = await vscode.window.showQuickPick(menuItems)
  if (selectedItem) {
    return vscode.commands.executeCommand(selectedItem.command, uri)
  }
}

export async function checkoutOnSave(uri: vscode.Uri): Promise<void> {
  console.log(uri.fsPath);
  await vscode.workspace.saveAll();
}
