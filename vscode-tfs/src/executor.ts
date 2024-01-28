import * as vscode from "vscode"

type Command = (uri: vscode.Uri) => Promise<void>

function getActiveDocument() {
  const { document } = vscode.window.activeTextEditor || {}
  return document && !document.isUntitled ? document : undefined
}

export function handle(command: Command) {
  return async (uri: vscode.Uri | undefined): Promise<void> => {
    if (!uri) {
      const document = getActiveDocument()
      uri = document ? document.uri : undefined
    }

    if (!uri) {
      throw new Error("Unknown path")
    }

    try {
      await command(uri)
    } catch (e) {
      await vscode.window.showErrorMessage(String(e))
    } finally {
      vscode.window.setStatusBarMessage("")
    }
  }
}
