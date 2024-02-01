import * as fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

function generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function compare_files(originalContent: string, 
    modifiedFileFullPath: string,
    contextGlobalStoragePath: string){
    try {
        // Ensure the globalStoragePath directory exists
        const globalStoragePath = contextGlobalStoragePath;
        if (!globalStoragePath) {
            throw new Error('Global storage path not available.');
        }
    
        if (!fs.existsSync(globalStoragePath)) {
            fs.mkdirSync(globalStoragePath);
        }
        
        // Get the extension's temporary directory
        const tempDir = globalStoragePath;
      
        // Create unique filenames for temporary files
        const originalFilename = `${path.basename(modifiedFileFullPath)}_${generateGuid()}.txt`;
        const originalPath = path.join(tempDir, originalFilename);
      
        // Create temporary files with the content
        fs.writeFileSync(originalPath, originalContent);
      
        // Open the documents
        const originalUri = vscode.Uri.file(originalPath);
        const modifiedUri = vscode.Uri.file(modifiedFileFullPath);
      
        let originalDocument = await vscode.workspace.openTextDocument(originalUri);
        const modifiedDocument = await vscode.workspace.openTextDocument(modifiedUri);
      
        // Show the documents side by side
        const diffCommand = vscode.commands.executeCommand("vscode.diff", originalDocument.uri, modifiedDocument.uri);
      
        // Delete temporary files after diff view is closed
        diffCommand.then(() => {
            fs.unlinkSync(originalPath);
        });
      }
      catch (error){
        console.log(error);
    }
}
