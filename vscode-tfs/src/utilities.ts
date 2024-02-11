import * as vscode from 'vscode';
import * as xml2js from 'xml2js';

export function getRootDirectory(): string | undefined {
    let rootDit = '';
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        rootDit = workspaceFolders[0].uri.fsPath;
    }
    return rootDit;
}

export function removeLeadingSlash(path: string): string {
    return path.replace(/^\//, '');
}

export async function parseXmlToObject(xmlData: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
      parser.parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
