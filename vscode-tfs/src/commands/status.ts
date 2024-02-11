import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"
import * as xml2js from 'xml2js';
import { PendingChange } from "../types/pendingChange";

export async function checkifFileIsUnderSourceControl(filePath: string) {
  try{
     let res = await tf(['status', filePath, '/recursive'])
     if(res.stderr.length > 0){
      return false;
     }
    return true;
  } catch(error){
    return false;
  }
}

export function getRootDirectory(): string | undefined {
    let rootDit = '';
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      rootDit = workspaceFolders[0].uri.fsPath;
    }
    return rootDit;
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
    let taskResult = await task;
    // Xml output
    const parsedObject = await parseXmlToObject(taskResult.stdout);
    const pendingChangesArray = parsedObject?.Status?.PendingSet?.PendingChanges?.PendingChange;
    if (!pendingChangesArray) {
      console.error('Error: Unable to retrieve pending changes from XML.');
      return pendingChanges; 
    }

    if (!Array.isArray(pendingChangesArray)) {
      console.error('Error: Pending changes is not an array.');
      return pendingChanges;
    }

    pendingChanges = pendingChangesArray.map((change: any) => {
      return {
        chg: change.chg || '',
        local: change.local || '',
        date: change.date || '',
        type: change.type || '',
        srcitem: change.srcitem || '',
      };
    });
  } catch (error) {
    console.error('Error parsing XML:', error);
  }

  return pendingChanges;
}