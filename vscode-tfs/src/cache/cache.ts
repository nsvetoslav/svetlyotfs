import * as vscode from "vscode"

export class SvetlyoTfsCache {
    constructor(private context: vscode.ExtensionContext){ }

    private getWorkspaceState(){
        return this.context.workspaceState;
    }

    getValue<T>(key: string) : T | undefined {
        return this.getWorkspaceState().get<T>(key);
    }

    setValue(key: string, value: string){
        this.getWorkspaceState().update(key, value);
    }

    addValue(key: string, value: string){
        this.setValue(key, value);
    }

    getAllKeys(){
        this.getWorkspaceState().keys();
    }
}
