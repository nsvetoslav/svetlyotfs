import * as fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { view } from '../commands/view';

export async function compare_files(filePath: string,
    contextGlobalStoragePath: string){
    try {
        const globalStoragePath = contextGlobalStoragePath;
        if (!globalStoragePath) {
            throw new Error('Global storage path not available.');
        }
    
        if (!fs.existsSync(globalStoragePath)) {
            fs.mkdirSync(globalStoragePath);
        }
        const tempDir = globalStoragePath;
        const originalFilename = `${path.basename(filePath)}`;
        const originalPath = path.join("D:\\", originalFilename);
        let task = await view(filePath, originalPath);
        const originalDocument = await vscode.workspace.openTextDocument(originalPath);
        const modifiedDocument = await vscode.workspace.openTextDocument(filePath);
        const diffCommand = vscode.commands.executeCommand("vscode.diff", originalDocument.uri, modifiedDocument.uri);
        diffCommand.then(() => {
            fs.unlinkSync(originalPath);
        });
      }
      catch (error){
        console.log(error);
    }
}
