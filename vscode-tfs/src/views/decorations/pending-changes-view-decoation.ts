import { pendingChangesProvider } from "../globals";
import { TfStatuses } from "../../tfs/statuses";
import { PendingChange } from "../../types/pendingChange";
import * as vscode from 'vscode';

export class PendingChangesViewDecorationProvider implements vscode.FileDecorationProvider {
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

    
    let nodeitem = pendingChangesProvider.getFileNode(uri);

  let pendingChange = this.fromFileChangeNodeUri(uri);
    if(pendingChange){
      pendingChange = pendingChange as PendingChange;
      let item = {
        propagate: false,
        color: this.color(pendingChange.chg),
				// badge: new vscode.ThemeIcon('close', new vscode.ThemeColor('list.errorForeground'))
        badge: pendingChange.chg.toString().charAt(0)
      }; 
      return item; 
    }
    else if(nodeitem != undefined){
      let item = {
        propagate: false,
        color: this.color(nodeitem.pendingChange.chg),
				// badge: new vscode.ThemeIcon('close', new vscode.ThemeColor('list.errorForeground'))
        badge: nodeitem.pendingChange.chg.toString().charAt(0)   
      };
      return item;
    }

    return undefined;
	}

  color(status: TfStatuses.TfStatus): vscode.ThemeColor {
		let color: string = this.remoteReposColors(status);
		return new vscode.ThemeColor(color);
	}

  remoteReposColors(status: TfStatuses.TfStatus): string  {
		switch (status) {
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