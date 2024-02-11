import { tf } from "../tfs/tfExe"

function removeLeadingSlash(path: string): string {
    return path.replace(/^\//, '');
}

export function rename(uri: string, newUri : string): Promise<{ stdout: string; stderr: string }> {
    return tf(["rename", removeLeadingSlash(uri), removeLeadingSlash(newUri)]);
}
