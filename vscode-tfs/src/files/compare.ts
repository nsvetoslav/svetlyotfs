import * as fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { view } from '../commands/view';

function generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function compare_files(filePath: string,
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
        // _${generateGuid()}.txt
        const originalFilename = `${path.basename(filePath)}`;
        const originalPath = path.join("D:\\", originalFilename);
        
        let task = await view(filePath, originalPath);
      
        const originalDocument = await vscode.workspace.openTextDocument(originalPath);
        const modifiedDocument = await vscode.workspace.openTextDocument(filePath);
      
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
