import * as vscode from 'vscode';
import * as path from 'path';
import { PendingChange, dirStatus, getRootDirectory } from '../commands/dirStatus';

let root = getRootDirectory();

export class PendingChangesProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  constructor(private workspaceRoot: string) {}
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
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

  getChildren(): Thenable<vscode.TreeItem[]> {
    return this.getFileNodes();
  }
}

class FileNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly filePath: string,
    public readonly pendingChange: PendingChange
  ) {
    super(label, collapsibleState);

    this.tooltip = this.filePath;
    this.command = {
      command: 'vscode.open',
      title: 'Open File',
      arguments: [vscode.Uri.file(this.filePath)],
  };
    
    if(root === undefined){
      return;
    }

    // Get the relative path from the workspace root
    const relativePath = path.relative(root, filePath);
    const directoryPart = path.dirname(relativePath);

    // You can customize the icon based on the pending change type
    this.iconPath = vscode.ThemeIcon.File;
    this.resourceUri = vscode.Uri.parse('_.'+ path.extname(filePath));
    this.description = directoryPart;
    this.contextValue = 'checkedOut';
    this.label = this.label;
  }
}