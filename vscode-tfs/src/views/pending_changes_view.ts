import * as vscode from 'vscode';
import * as path from 'path';
import { dirStatus, getRootDirectory } from '../commands/status';
import { PendingChange } from '../types/pendingChange';
import { TfStatuses } from '../tfs/statuses';

let root = getRootDirectory();

export enum Schemes {
	FileChange = 'filechange',
}

export function toResourceUri(uri: vscode.Uri, item : PendingChange ) {
  return uri.with({
		scheme: Schemes.FileChange,
		query: JSON.stringify(item),
	});
}

export class PendingChangesProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  constructor() {}
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
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
        const pendingChanges = await dirStatus();
        const folderNodesMap = new Map<string, FolderNode>();

        for (const change of pendingChanges) {
            const directoryPart = path.dirname(change.local);
            let folderNode = folderNodesMap.get(directoryPart);

            if (!folderNode) {
                folderNode = new FolderNode(path.basename(directoryPart), vscode.TreeItemCollapsibleState.Expanded, [], directoryPart);
                folderNodesMap.set(directoryPart, folderNode);
            }

            const fileNode = new FileNode(path.basename(change.local), vscode.TreeItemCollapsibleState.Expanded, change.local, change);
            this.fileNodes.push(fileNode);
            folderNode.children.push(fileNode);
        }

        return Array.from(folderNodesMap.values());
    } catch (error) {
        throw error;
    }
}
  private async getFileNodes(): Promise<FileNode[]> {
    try {
     
    const pendingChanges = await dirStatus();

    return pendingChanges.map((change) => {
      return new FileNode(path.basename(change.local), vscode.TreeItemCollapsibleState.None, change.local, change);
    }); 
    } catch (error) {
      
    }
    throw("");
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  // getChildren(): Thenable<vscode.TreeItem[]> {
    
  //   return this.getFileNodes();
  // }

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

class FileNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly filePath: string,
    public readonly pendingChange: PendingChange
  ) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);

    this.tooltip = TfStatuses.getDescriptionText(pendingChange.chg);
    this.command = {
      command: 'vscode.open',
      title: 'Open File',
      arguments: [vscode.Uri.file(this.filePath)],
  };
    
    if(root === undefined){
      return;
    }    // Get the relative path from the workspace root
    const relativePath = path.relative(root, filePath);
    const directoryPart = path.dirname(relativePath);

    // You can customize the icon based on the pending change type
    this.iconPath = vscode.ThemeIcon.File;
    this.resourceUri = toResourceUri(vscode.Uri.parse('_.'+ path.extname(filePath)), this.pendingChange);    
    this.description = directoryPart;
    this.contextValue = 'checkedOut';
    this.label = this.label;
  }
}