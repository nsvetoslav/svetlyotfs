import { removeLeadingSlash } from "../globals";
import { tf } from "../tfs/tfExe"


export function rename(uri: string, newUri : string): Promise<{ stdout: string; stderr: string }> {
    return tf(["rename", removeLeadingSlash(uri), removeLeadingSlash(newUri)]);
}
