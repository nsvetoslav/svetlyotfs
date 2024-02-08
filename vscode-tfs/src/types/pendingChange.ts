import { TfStatuses } from '../tfs/statuses';

export interface PendingChange {
    chg: TfStatuses.TfStatus;
    local: string;
    date: string;
    type: string;
}
