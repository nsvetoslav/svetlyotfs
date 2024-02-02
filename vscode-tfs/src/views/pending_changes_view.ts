import * as vscode from 'vscode';
import * as path from 'path';
import { PendingChange, dirStatus, getRootDirectory } from '../commands/dirStatus';

let root = getRootDirectory();

function parseDiff(diffString: string): { original: string, modified: string } {
  const lines = diffString.split('\n');

  let originalLines: string[] = [];
  let modifiedLines: string[] = [];
  let inOriginal = false;
  let inModified = false;

  for (const line of lines) {
      if (line.startsWith('<')) {
          inOriginal = true;
          inModified = false;
          originalLines.push(line.substring(2));
      } else if (line.startsWith('>')) {
          inOriginal = false;
          inModified = true;
          modifiedLines.push(line.substring(2));
      } else if (inOriginal) {
          originalLines.push(line.substring(2));
      } else if (inModified) {
          modifiedLines.push(line.substring(2));
      }
  }

  const originalContent = originalLines.join('\n');
  const modifiedContent = modifiedLines.join('\n');

  return { original: originalContent, modified: modifiedContent };
}

// Example usage:
const diffString = `
2,4c2,4
<     "ConnectionStrings": {
<         "DefaultConnection": "Server=SERVERNAME\\SQL2019;Database=bDigital;User Id=;Password=;MultipleActiveResultSets=true"
<     },
---
>   "ConnectionStrings": {
>     "DefaultConnection": "Server=sinikolov\\SQL2019;Database=bDigital;User Id=sa;Password=massive;MultipleActiveResultSets=true"
>   },
===================================================================
`;

const { original, modified } = parseDiff(diffString);

console.log("Original File Content:\n", original);
console.log("\nModified File Content:\n", modified);


export class PendingChangesProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  constructor(private workspaceRoot: string) {}

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