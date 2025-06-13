import * as vscode from 'vscode';
import { Changeset, PendingChange } from '../TFS/Types';  
import { Schemes } from './PendingChangesTreeView';

export class FileHistoryTreeView implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private static instance: FileHistoryTreeView;
    private changesets: Changeset[] = []; 
    private constructor() { }
  
    public static getInstance(): FileHistoryTreeView {
      if (!FileHistoryTreeView.instance) {
        FileHistoryTreeView.instance = new FileHistoryTreeView();
      }
  
      return FileHistoryTreeView.instance;
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve(this.changesets.map(cs => {
                const label = `Changeset ${cs.changesetId}`;
                const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
                item.description = `Changed by ${cs.user} on ${cs.date}`;
                item.tooltip = `Changeset ${cs.changesetId}\nBy ${cs.user} on ${cs.date}\nComment: ${cs.comment}`;
                item.resourceUri = this.toResourceUri(vscode.Uri.parse('_.'+ ''), cs as any);    

                return item;
            }));
        }
    }

    toResourceUri(uri: vscode.Uri, item : PendingChange ) {
        return uri.with({
          scheme: Schemes.FileChange,
          query: JSON.stringify(item),
        });
      }
      
    public refresh(changesets: Changeset[]): void {
        this.changesets = changesets;
        this._onDidChangeTreeData.fire();
    }
  }