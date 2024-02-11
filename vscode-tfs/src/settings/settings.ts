import * as vscode from "vscode"
import { SvetlyoTfsCache } from "../cache/cache";

enum SettingNames
{
    ActiveWorkspace = "ActiveWorkspace"
};

export class Settings {
    constructor(private context: vscode.ExtensionContext) { }

    private cache : SvetlyoTfsCache = new SvetlyoTfsCache(this.context);

    getActiveTfsWorkspace(){
        this.cache.getValue(SettingNames.ActiveWorkspace.toString());
    }

    setActiveTfsWorkspace(workspaceName: string){
        this.cache.setValue(SettingNames.ActiveWorkspace.toString(), workspaceName)
    }
}
