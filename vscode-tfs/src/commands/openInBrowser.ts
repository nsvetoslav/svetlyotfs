import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"
import { parse } from "../tfs/output/parse"
import { buildVersionControlUrl } from "../tfs/web"

async function tfWorkfold(fsPath: string): Promise<TfWorkfold> {
  const res = await tf(["workfold", fsPath])
  return parse(res.stdout) as TfWorkfold
}

async function tfInfo(fsPath: string): Promise<TfInfo> {
  const res = await tf(["info", fsPath])
  return parse(res.stdout) as TfInfo
}

// FIXME
const hasIssue = !String(vscode.Uri.parse("http://host/#test=value")).includes("test=value")
function applyWorkaround(uri: vscode.Uri, expectedUri: string) {
  if (hasIssue) {
    ;(uri as any)._formatted = expectedUri
  }
}

export async function openInBrowser(uri: vscode.Uri): Promise<void> {
  const tasks = Promise.all([tfWorkfold(uri.fsPath), tfInfo(uri.fsPath)])

  vscode.window.setStatusBarMessage("TFS: Retrieving file info...", tasks)
  const [workfold, info] = await tasks

  if (!info.localInformation.serverPath) {
    throw new Error(`The file is not under version control`)
  }

  const versionControlUrl = buildVersionControlUrl(workfold.collection, info.localInformation.serverPath)
  const urlToOpen = vscode.Uri.parse(versionControlUrl)
  applyWorkaround(urlToOpen, versionControlUrl)

  const taskOpenInBrowser = vscode.commands.executeCommand("vscode.open", urlToOpen)
  vscode.window.setStatusBarMessage("TFS: Opening in browser...", taskOpenInBrowser)
  await taskOpenInBrowser
}
