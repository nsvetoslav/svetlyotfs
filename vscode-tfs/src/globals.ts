import { PendingChangesProvider } from './views/pending_changes_view';

export function removeLeadingSlash(path: string): string {
    return path.replace(/^\//, '');
  }

// Global exports
export let pendingChangesProvider = new PendingChangesProvider();
