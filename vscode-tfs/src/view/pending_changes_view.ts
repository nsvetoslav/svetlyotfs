import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class PendingChangesProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  constructor(private workspaceRoot: string) {}

  private getFolderNodes(): Thenable<FolderNode[]> {
    return new Promise((resolve, reject) => {
      if (!this.workspaceRoot) {
        vscode.window.showInformationMessage('Workspace is empty');
        resolve([]);
      }

      fs.readdir(this.workspaceRoot, { withFileTypes: true }, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        const folders = files.filter((file) => file.isDirectory()).map((folder) => {
          const folderPath = path.join(this.workspaceRoot!, folder.name);
          return new FolderNode(folder.name, vscode.TreeItemCollapsibleState.Collapsed, folderPath);
        });

        resolve(folders);
      });
    });
  }

  private getFileNodes(folderPath: string): Thenable<FileNode[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        const fileNodes = files.map((file) => {
          const filePath = path.join(folderPath, file);
          return new FileNode(file, vscode.TreeItemCollapsibleState.None, filePath);
        });

        resolve(fileNodes);
      });
    });
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (!element) {
      // Root level, show folders
      return this.getFolderNodes();
    } else if (element instanceof FolderNode) {
      // Child level, show files in the folder
      return this.getFileNodes(element.folderPath);
    }

    return Promise.resolve([]);
  }
}

class FileNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly filePath: string
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.filePath}`;
    this.command = {
      command: 'extension.openFile',
      title: 'Open File',
      arguments: [this.filePath],
    };
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}

class FolderNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly folderPath: string
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    this.contextValue = 'folder';
  }
}
