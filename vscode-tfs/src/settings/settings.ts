import * as vscode from "vscode"
import { SvetlyoTfsCache } from "../cache/cache";
import { TfTypes } from '../teamserver/types';
import { TeamServer } from "../teamserver/teamserver";

enum SettingNames
{
    ActiveWorkspace = "ActiveWorkspace"
};

export class Settings {
    private static _instance: Settings;
    private static _context: vscode.ExtensionContext;
    private static _cache : SvetlyoTfsCache;
    private static _workspaceInfo : TfTypes.WorkspaceInfo;

    private constructor() { }

    public static getInstance(): Settings {
        if (!Settings._instance) {
            Settings._instance = new Settings();
        }

        return Settings._instance;
    }

    public setContext(context: vscode.ExtensionContext){
        Settings._context = context;
        Settings._cache = new SvetlyoTfsCache(Settings._context);
    }

    public getActiveTfsWorkspace<T>(){
        return Settings._cache.getValue<T>(SettingNames.ActiveWorkspace.toString());
    }

    public getWorkspaceInfo() : TfTypes.WorkspaceInfo {
        return Settings._workspaceInfo;
    }

    public setWorkspaceInfo(){
        TeamServer.getInstance().getWorkspaces().then((setting) => {
            if(setting && setting.workspaces.length > 0){
                if(this.getActiveTfsWorkspace<string>() === undefined){
                    this.setActiveTfsWorkspace(setting.workspaces[0]);
                }
                Settings._workspaceInfo = setting;
            }
        }).catch((error) => {
            console.log("Error setting default TFS workspace.", error);
        });
    }

    public setActiveTfsWorkspace(workspaceName: string){
        Settings._cache.setValue(SettingNames.ActiveWorkspace.toString(), workspaceName)
    }
}
