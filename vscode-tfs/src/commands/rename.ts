import { tf } from "../tfs/tfExe"
import { removeLeadingSlash } from "../utilities";

export function rename(uri: string, newUri : string): Promise<{ stdout: string; stderr: string }> {
    return tf(["rename", removeLeadingSlash(uri), removeLeadingSlash(newUri)]);
}
