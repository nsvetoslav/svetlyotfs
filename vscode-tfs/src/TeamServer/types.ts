import { TfStatuses } from "../tfs/statuses"

export namespace TfTypes{
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

    export enum TfStatus{
        AddEditEncoding = "Add Edit Encoding",
        Add = "Add",
        Branch = "Branch",
        Delete = "Delete",
        Edit = "Edit",
        Encoding = "Encoding",
        Lock = "Lock",
        Merge = "Merge",
        None = "None",
        Property = "Property",
        Rename = "Rename",
        Rollback = "Rollback",
        SourceRename = "SourceRename",
        Undelete = "Undelete",
    }

    export function getDescriptionText(state: TfStatus){
    switch(state){
        case TfStatus.AddEditEncoding:
            return 'The file is added';
        case TfStatus.Add:
            return 'The file is added';
        case TfStatus.Branch:
            return 'The file is branched';
        case TfStatus.Delete:
            return 'The file is deleted';
        case TfStatus.Edit:
            return 'The file is edited';
        case TfStatus.Encoding:
            return 'The file is encoded';
        case TfStatus.Lock:
            return 'The file is locked';
        case TfStatus.Merge:
            return 'The files is merged';
        case TfStatus.None:
            return '';
        case TfStatus.Property:
            return 'The file s a property';
        case TfStatus.Rename:
            return 'The file is renamed';
        case TfStatus.Rollback:
            return 'The file is rollbacked';
        case TfStatus.SourceRename:
            return 'The file is source renamed';
        case TfStatus.Undelete:
            return 'The file is undeleted';
    }
    }
}
