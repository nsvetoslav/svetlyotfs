import * as vscode from "vscode"
import { promisify } from "util"
import { execFile } from "child_process"

const pExecFile = promisify(execFile)

export async function tf(args: Array<string>): Promise<{ stdout: string; stderr: string }> {
  const tfPath: string | undefined = vscode.workspace.getConfiguration("tfs").get("location")

  if (!tfPath) {
    throw new Error("tf.exe path is not configured")
  }

  try {
    return pExecFile(tfPath, args)
  } catch (err) {
    throw new Error(err.stderr ? err.stderr : err.message)
  }
}
