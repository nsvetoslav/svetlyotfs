import * as vscode from 'vscode';
import * as path from 'path';
import { dirStatus, getRootDirectory } from '../commands/status';
import { PendingChange } from '../types/pendingChange';

let root = getRootDirectory();


export enum Schemes {
	File = 'file',
	Review = 'review',
	Pr = 'pr',
	PRNode = 'prnode',
	FileChange = 'filechange',
	GithubPr = 'githubpr',
	GitPr = 'gitpr',
	VscodeVfs = 'vscode-vfs', // Remote Repository
	Comment = 'comment' // Comments from the VS Code comment widget
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
    this.iconPath = 'C:\\Users\\Svetlyo\\Desktop\\svetlyotfs\\vscode-tfs\\res\\icon-status-modified.svg';
    this.resourceUri = toResourceUri(vscode.Uri.parse('_.'+ path.extname(filePath)), this.pendingChange);    
    this.description = directoryPart;
    this.contextValue = 'checkedOut';
    this.label = this.label;
  }
}