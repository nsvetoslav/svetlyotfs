import { tf } from "../tfs/tfExe"
import { pendingChangesProvider } from "../globals"
import { removeLeadingSlash } from "../utilities";

export async function add(path: string): Promise<void> {
  await tf(['add', removeLeadingSlash(path)]);
  pendingChangesProvider.refresh();
}
