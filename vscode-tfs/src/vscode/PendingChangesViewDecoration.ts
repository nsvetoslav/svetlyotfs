import * as vscode from 'vscode';
import { PendingChangesTreeView } from './PendingChangesTreeView';
import { PendingChange, TfStatus } from '../TFS/Types';

export class PendingChangesViewDecoration implements vscode.FileDecorationProvider {
	private _disposables: vscode.Disposable[] = [];
  constructor() {
		this._disposables.push(vscode.window.registerFileDecorationProvider(this));
	} 
  
fromFileChangeNodeUri(uri: vscode.Uri): PendingChange | undefined {
	try {
		return uri.query ? JSON.parse(uri.query) as PendingChange : undefined;
	} catch (e) { }

  
  return undefined;
}

  onDidChangeFileDecorations?: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> | undefined
	provideFileDecoration(
		uri: vscode.Uri,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.FileDecoration> {
    
    const fileNode = PendingChangesTreeView.getInstance().getFileNode(uri);
    const folderNode = PendingChangesTreeView.getInstance().getFolderNode(uri);
    let pendingChange = this.fromFileChangeNodeUri(uri);

    if(pendingChange) {
        pendingChange = pendingChange as PendingChange;
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

  color(status: TfStatus): vscode.ThemeColor {
		let color: string = this.remoteReposColors(status);
		return new vscode.ThemeColor(color);
	}

  // Тази функция я описвам просто с ":D"
  remoteReposColors(status: TfStatus): string  {
		switch (status) {
      case TfStatus.AddEncoding:
				return 'gitDecoration.addedResourceForeground';
      case TfStatus.AddEditEncoding:
				return 'gitDecoration.addedResourceForeground';
			case TfStatus.Edit:
				return 'gitDecoration.modifiedResourceForeground';
			case TfStatus.Add:
				return 'gitDecoration.addedResourceForeground';
			case TfStatus.Delete:
				return 'gitDecoration.deletedResourceForeground';
			case TfStatus.Rename:
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