import { TfStatuses } from "../tfs/statuses"

export type TfWorkfold = {
    collection: string
}
  
export type TfInfo = {
    localInformation: {
        serverPath: string
    }
}

export type Command = {
    title: string
    detail?: string
    command: string
  }
  
  export interface WorkspaceInfo {
    collection: string;
    workspaces: string[];
  }
  
  export interface PendingChange {
    chg: TfStatuses.TfStatus;
    srcitem: string;
    local: string;
    date: string;
    type: string;
}
