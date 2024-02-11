import { TfStatuses } from '../tfs/statuses';

export interface PendingChange {
    chg: TfStatuses.TfStatus;
    srcitem: string;
    local: string;
    date: string;
    type: string;
}
