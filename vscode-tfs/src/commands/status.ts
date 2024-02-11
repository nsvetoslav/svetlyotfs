import { tf } from "../tfs/tfExe"
import { PendingChange } from "../types/tfTypes";
import { getRootDirectory, parseXmlToObject } from "../utilities";

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