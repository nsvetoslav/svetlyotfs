import * as vscode from 'vscode'
import * as os from 'os'
import * as path from 'path'
import * as xml2js from 'xml2js';
import { TfTypes } from './types';
import { FileNode } from '../scm/view/pendingchanges';

export class Utilities {
    static removeLeadingSlash(uri: vscode.Uri) {
        return uri.path.replace(/^\//, '');
    }

    static getGlobalStoragePath() {
        return os.homedir();
    }

    static generateTemporaryFileNameFromUri(uri: FileNode) {
        return path.join(Utilities.getGlobalStoragePath(), path.basename(uri.filePath));
    }

    static getWorkspaceDirectory() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].uri.fsPath;
        }
        return '';
    }

     static async xmlToObject(xml: string) : Promise<any> {
        const parser = new xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true
        })
          try {
            const cleanedXml = xml.replace(/\r?\n|\r/g, '').trim();
            return await parser.parseStringPromise(cleanedXml);
          } catch (error: any) {
            console.log("TFS: Parsing XML failed.\n Error:", error.message, `\n XML: ${xml}`);
          }

          return undefined;
      }

      static async tfsStatusXmlToTypedArray(xml: string): Promise<TfTypes.PendingChange[]> {
        const pendingChanges: TfTypes.PendingChange[] = [];
        const parsedObject = await Utilities.xmlToObject(xml);
        if (!parsedObject || !parsedObject.Status || !parsedObject.Status.PendingSet || !parsedObject.Status.PendingSet.PendingChanges || !parsedObject.Status.PendingSet.PendingChanges.PendingChange) {
            return pendingChanges; 
        }
       
        if (Array.isArray(parsedObject.Status.PendingSet.PendingChanges.PendingChange)) {
            pendingChanges.push(...parsedObject.Status.PendingSet.PendingChanges.PendingChange);
        } else {
            pendingChanges.push(parsedObject.Status.PendingSet.PendingChanges.PendingChange);
        }
    
        return pendingChanges;
    }
}