import * as vscode from 'vscode';
import { PendingChangesSCM } from './pendingchanges';
import { TfStatuses } from './statuses';
import { TfTypes } from './types';

export class PendingChangesViewDecorationProvider implements vscode.FileDecorationProvider {
	private _disposables: vscode.Disposable[] = [];
  constructor() {
		this._disposables.push(vscode.window.registerFileDecorationProvider(this));
	} 
  
fromFileChangeNodeUri(uri: vscode.Uri): TfTypes.PendingChange | undefined {
	try {
		return uri.query ? JSON.parse(uri.query) as TfTypes.PendingChange : undefined;
	} catch (e) { }

  
  return undefined;
}

  onDidChangeFileDecorations?: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> | undefined
	provideFileDecoration(
		uri: vscode.Uri,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.FileDecoration> {
    
    const fileNode = PendingChangesSCM.getInstance().getFileNode(uri);
    const folderNode = PendingChangesSCM.getInstance().getFolderNode(uri);
    let pendingChange = this.fromFileChangeNodeUri(uri);

    if(pendingChange) {
        pendingChange = pendingChange as TfTypes.PendingChange;
        return {
          propagate: false,
          color: this.color(pendingChange.chg),
          badge: pendingChange.chg.toString().charAt(0)
      }; 
    }
    else if(fileNode != undefined){
      return {
        propagate: false,
        color: this.color(fileNode.pendingChange.chg),
        badge: fileNode.pendingChange.chg.toString().charAt(0)   
      };
    }
    else if(folderNode != undefined){
      return {
        propagate: false,
        color: this.color(folderNode.pendingChange.chg),
        badge: folderNode.pendingChange.chg.toString().charAt(0)   
      };
    }

    return undefined;
	}

  color(status: TfStatuses.TfStatus): vscode.ThemeColor {
		let color: string = this.remoteReposColors(status);
		return new vscode.ThemeColor(color);
	}

  // Тази функция я описвам просто с ":D"
  remoteReposColors(status: TfStatuses.TfStatus): string  {
		switch (status) {
      case TfStatuses.TfStatus.AddEncoding:
				return 'gitDecoration.addedResourceForeground';
      case TfStatuses.TfStatus.AddEditEncoding:
				return 'gitDecoration.addedResourceForeground';
			case TfStatuses.TfStatus.Edit:
				return 'gitDecoration.modifiedResourceForeground';
			case TfStatuses.TfStatus.Add:
				return 'gitDecoration.addedResourceForeground';
			case TfStatuses.TfStatus.Delete:
				return 'gitDecoration.deletedResourceForeground';
			case TfStatuses.TfStatus.Rename:
				return 'gitDecoration.renamedResourceForeground';
      default:
        return '';
		}
	}

  dispose() {
    this._disposables.forEach(disposable => {
      disposable.dispose();
    });
	}
}