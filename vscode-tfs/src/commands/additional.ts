import { tf } from "../tfs/tfExe"
import { WorkspaceInfo } from "../types/tfTypes";

export async function get_workspaces(){
  const task = tf(["workspaces"])
  const connectionsOutput = (await task).stdout;
  const splittedConnectionsOutput = connectionsOutput.split('\n');

  const workspaceInfo: WorkspaceInfo = {
    collection: '',
    workspaces: []
  };

  for (let i = 0; i < splittedConnectionsOutput.length; i++) {
      const line = splittedConnectionsOutput[i].trim();
      if (line.startsWith('Collection:')) {
          workspaceInfo.collection = line.substring('Collection:'.length).trim();
      } else if (line && i >= 3) {
          const workspaceName = line.split(/\s+/)[0];
          workspaceInfo.workspaces.push(workspaceName);
      }
  }
  
  console.log(workspaceInfo);
  return workspaceInfo;
}
