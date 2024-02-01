import { PendingChangesProvider } from './pending_changes_view';
import * as vscode from 'vscode';

const rootPath =
vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
  ? vscode.workspace.workspaceFolders[0].uri.fsPath
  : "";

export let pendingChangesProvider = new PendingChangesProvider(rootPath as string);
