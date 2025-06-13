import * as vscode from "vscode"
import { spawnSync } from "child_process"
import * as iconv from 'iconv-lite';

export async function tf(args: Array<string>) {
  const tfPath: string | undefined = vscode.workspace.getConfiguration("tfs").get("location")

  if (!tfPath) {
    throw new Error("tf.exe path is not configured")
  }
 
  try {
    let task = await spawnSync(tfPath, args, {encoding: 'buffer'});
    if(task.stderr.toString().length > 0){
      throw new Error(task.stderr.toString());
    }
    const outputString = iconv.decode(task.stdout, 'win1251');
    return outputString;
  } catch (err:any) {
    throw new Error(err.stderr ? err.stderr : err.message);
  }
}


