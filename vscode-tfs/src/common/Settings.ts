import * as vscode from "vscode"
import { LocalCache } from "./LocalCache";
import { TFSCommandExecutor } from "../TFS/Commands";
import { WorkspaceInfo } from "../TFS/Types";

enum SettingNames
{
    ActiveWorkspace = "ActiveWorkspace"
};

export class Settings {
    private static _instance: Settings;
    private static _context: vscode.ExtensionContext;
    private static _cache : LocalCache;
    private static _workspaceInfo : WorkspaceInfo;

    private constructor() { }

    public static getInstance(): Settings {
        if (!Settings._instance) {
            Settings._instance = new Settings();
        }

        return Settings._instance;
    }

    public setContext(context: vscode.ExtensionContext){
        Settings._context = context;
        Settings._cache = new LocalCache(Settings._context);
    }

    public getActiveTfsWorkspace<T>(){
        return Settings._cache.getValue<T>(SettingNames.ActiveWorkspace.toString());
    }

    public getWorkspaceInfo() : WorkspaceInfo {
        return Settings._workspaceInfo;
    }

    public setWorkspaceInfo(){
        TFSCommandExecutor.getInstance().getWorkspaces().then((setting) => {
            if(!setting || setting.workspaces.length <= 0)
                return;
            
            this.setActiveTfsWorkspace(setting.workspaces[0]);
            
            Settings._workspaceInfo = setting;

        }).catch((error) => {
            console.log("Error setting default TFS workspace.", error);
        });
    }

    public setActiveTfsWorkspace(workspaceName: string){
        if(this.getActiveTfsWorkspace<string>() === undefined){
            Settings._cache.setValue(SettingNames.ActiveWorkspace.toString(), workspaceName)
        }
    }
}
