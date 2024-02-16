import * as vscode from 'vscode';
import { TfStatuses } from '../../tfs/statuses';
import { TfTypes } from '../../teamserver/types';
import { PendingChangesSCM } from '../view/pendingchanges';

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
    
    let nodeitem = PendingChangesSCM.getInstance().getFileNode(uri);

  let pendingChange = this.fromFileChangeNodeUri(uri);
    if(pendingChange){
      pendingChange = pendingChange as TfTypes.PendingChange;
      let item = {
        propagate: false,
        color: this.color(pendingChange.chg),
        badge: pendingChange.chg.toString().charAt(0)
      }; 
      return item; 
    }
    else if(nodeitem != undefined){
      let item = {
        propagate: false,
        color: this.color(nodeitem.pendingChange.chg),
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