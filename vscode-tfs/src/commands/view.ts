import * as vscode from "vscode"
import { tf } from "../tfs/tfExe"

export async function view(uri: string, tempuri: string): Promise<any> {
    let task: any;
    try {
        task = tf(["view", uri ,`/output:${tempuri}`])
        await task   
    } catch (error) {
        console.log(error);
    }
    return task;
}
