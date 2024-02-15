import * as vscode from 'vscode';
import * as path from 'path';
import { TfStatuses } from '../../tfs/statuses';
import { TfTypes } from '../../TeamServer/types';
import { Utilities } from '../../TeamServer/utils';
import { TeamServer } from '../../TeamServer/teamserver';

export enum Schemes {
	FileChange = 'filechange',
}

export function toResourceUri(uri: vscode.Uri, item : TfTypes.PendingChange ) {
  return uri.with({
		scheme: Schemes.FileChange,
		query: JSON.stringify(item),
	});
}

export class PendingChangesSCM implements vscode.TreeDataProvider<vscode.TreeItem> {
  private static instance: PendingChangesSCM;
  private constructor() {this.loadItems()}

  public static getInstance(): PendingChangesSCM {
    if (!PendingChangesSCM.instance) {
      PendingChangesSCM.instance = new PendingChangesSCM();
    }

    return PendingChangesSCM.instance;
}

  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  private async loadItems() {
    try {
        await this.getFolderNodes();
        this.refresh();
    } catch (error) {
        vscode.window.showErrorMessage(`Error loading pending changes: ${error}`);
    }
}
  fileNodes : FileNode[] = [];

  getFileNode(uri: vscode.Uri) {
    const uriFileName = path.basename(uri.fsPath);
    return this.fileNodes.find(element => {
        const nodeFileName = path.basename(element.filePath);
        return nodeFileName === uriFileName;
    });
}

  private async getFolderNodes(): Promise<FolderNode[]> {
    try {
        const pendingChanges = await TeamServer.getInstance().status(vscode.Uri.parse(Utilities.getWorkspaceDirectory()));
        if(pendingChanges === undefined){
            return [];
        }

        const folderNodesMap = new Map<string, FolderNode>();

        for (const change of pendingChanges) {
            const directoryPart = path.dirname(change.local);
            let folderNode = folderNodesMap.get(directoryPart);

            if (!folderNode) {
                folderNode = new FolderNode(path.basename(directoryPart), vscode.TreeItemCollapsibleState.Expanded, [], directoryPart);
                folderNodesMap.set(directoryPart, folderNode);
            }

            const fileNode = new FileNode(path.basename(change.local), vscode.TreeItemCollapsibleState.None, change.local, change);
            this.fileNodes.push(fileNode);
            folderNode.children.push(fileNode);
        }

        return Array.from(folderNodesMap.values());
    } catch (error) {
        throw error;
    }
}
  
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (!element) {
        return this.getFolderNodes();
    } else if (element instanceof FolderNode) {
        return Promise.resolve(element.children);
    } else {
        return Promise.resolve([]);
    }
  }
}

class FolderNode extends vscode.TreeItem {
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly children: vscode.TreeItem[],
      public readonly folderPath: string
  ) {
      super(label, vscode.TreeItemCollapsibleState.Expanded);
      this.iconPath = vscode.ThemeIcon.Folder;
      this.resourceUri = vscode.Uri.parse(folderPath);    

      this.contextValue = 'checkedOut';
  }
}

function strikethrough(text: string): string {
  return text.split('').map(t => t + '\u0336').join('');
}

class FileNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly filePath: string,
    public readonly pendingChange: TfTypes.PendingChange
  ) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);

    this.tooltip = TfStatuses.getDescriptionText(pendingChange.chg);
    this.command = {
      command: 'vscode.open',
      title: 'Open File',
      arguments: [vscode.Uri.file(this.filePath)],
  };
    
    if(Utilities.getWorkspaceDirectory() === undefined){
      return;
    } 
    const relativePath = path.relative(Utilities.getWorkspaceDirectory(), filePath);
    const directoryPart = path.dirname(relativePath);

    this.iconPath = vscode.ThemeIcon.File;
    this.resourceUri = toResourceUri(vscode.Uri.parse('_.'+ path.extname(filePath)), this.pendingChange);    
    this.description = directoryPart;
    
    if(this.pendingChange.chg == TfStatuses.TfStatus.Delete){
      this.label = strikethrough(this.label);
      this.description = strikethrough(this.description);
    }

    if(this.pendingChange.chg == TfStatuses.TfStatus.Rename){
      this.description = this.pendingChange.srcitem;
    }
    
    this.contextValue = 'checkedOut';
    this.label = this.label;
  }
}