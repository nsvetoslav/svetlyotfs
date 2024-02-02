import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"
import * as xml2js from 'xml2js';

export interface PendingChange {
    chg: string;
    local: string;
    date: string;
    type: string;
}

export function getRootDirectory(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
  
    if (workspaceFolders && workspaceFolders.length > 0) {
      // Assuming you want the first root folder; modify as needed
      const rootFolder = workspaceFolders[0].uri.fsPath;
      return rootFolder;
    }
  
    return undefined;
  }

async function parseXmlToObject(xmlData: string): Promise<any> {
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

  export async function dirStatus(): Promise<PendingChange[]> {
    let path = getRootDirectory();
    const task = tf(["status", "/recursive", "/format:xml", `${path}`]);
    let pendingChanges: PendingChange[] = [];
  
    try {
      let xmlData = (await task);
      const parsedObject = await parseXmlToObject(xmlData.stdout);
      console.log(parsedObject);
  
      const pendingChangesArray = parsedObject?.Status?.PendingSet?.PendingChanges?.PendingChange;
  
      if (!pendingChangesArray) {
        console.error('Error: Unable to retrieve pending changes from XML.');
        return pendingChanges; // or handle the error in an appropriate way
      }
  
      if (!Array.isArray(pendingChangesArray)) {
        console.error('Error: Pending changes is not an array.');
        return pendingChanges; // or handle the error in an appropriate way
      }
  
      pendingChanges = pendingChangesArray.map((change: any) => {
        return {
          chg: change.chg || '',
          local: change.local || '',
          date: change.date || '',
          type: change.type || '',
          // Add more properties as needed
        };
      });
    } catch (error) {
      console.error('Error parsing XML:', error);
    }
  
    return pendingChanges;
  }