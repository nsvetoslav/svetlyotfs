import * as vscode from 'vscode';
import { TfTypes } from '../../teamserver/types';
import { Schemes } from './pendingchanges';
import path from 'path';

export class FileHistorySCM implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private static instance: FileHistorySCM;
    private changesets: TfTypes.Changeset[] = []; 
    private constructor() { }
  
    public static getInstance(): FileHistorySCM {
      if (!FileHistorySCM.instance) {
        FileHistorySCM.instance = new FileHistorySCM();
      }
  
      return FileHistorySCM.instance;
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (element) {
            // Since we're making them not expandable, return no children.
            return Promise.resolve([]);
        } else {
            // Return the root level items (changesets) with label and description.
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

    toResourceUri(uri: vscode.Uri, item : TfTypes.PendingChange ) {
        return uri.with({
          scheme: Schemes.FileChange,
          query: JSON.stringify(item),
        });
      }
      
    public refresh(changesets: TfTypes.Changeset[]): void {
        this.changesets = changesets;
        this._onDidChangeTreeData.fire();
    }
  }