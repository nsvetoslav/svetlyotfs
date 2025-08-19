import * as vscode from "vscode";
import { TFSCommandExecutor } from "./Commands";
import { BlameResult } from "./Types";
import { Utilities } from "../common/Utilities";

export class BlameManager {
    private static instance: BlameManager;
    private cache: Map<string, BlameResult>;
    private cacheSizeLimit: number;
    private enabled: boolean;

    private constructor() {
        this.cache = new Map();
        this.cacheSizeLimit = vscode.workspace.getConfiguration("tfs").get("blame.cacheSize", 50);
        this.enabled = vscode.workspace.getConfiguration("tfs").get("blame.enabled", true);
    }

    public static getInstance(): BlameManager {
        if (!BlameManager.instance) {
            BlameManager.instance = new BlameManager();
        }

        return BlameManager.instance;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public async getFileBlame(uri: vscode.Uri): Promise<BlameResult | undefined> {
        if (!this.enabled) {
            return undefined;
        }

        const filePath = uri.fsPath;
        
        // Check if we have cached blame information
        if (this.cache.has(filePath)) {
            const cachedResult = this.cache.get(filePath)!;
            
            // Check if the cached result is still valid
            if (this.isCacheValid(filePath, cachedResult)) {
                return cachedResult;
            } else {
                // Remove invalid cache entry
                this.cache.delete(filePath);
            }
        }
        
        // Get blame information from TFS
        try {
            const blameResult = await TFSCommandExecutor.getInstance().annotate(uri);
            
            if (blameResult) {
                // Cache the result
                this.cache.set(filePath, blameResult);
                
                // Check cache size and evict if necessary
                this.evictCacheIfNecessary();
                
                return blameResult;
            }
        } catch (error) {
            console.error("Error getting blame information:", error);
        }
        
        return undefined;
    }

    private isCacheValid(filePath: string, cachedResult: BlameResult): boolean {
        // Check if the file has been modified since the cache was created
        try {
            const fs = require('fs');
            const stats = fs.statSync(filePath);
            return stats.mtime <= cachedResult.timestamp;
        } catch (error) {
            // If we can't get file stats, assume the cache is invalid
            return false;
        }
    }

    private evictCacheIfNecessary() {
        // If cache size exceeds limit, remove the oldest entries
        while (this.cache.size > this.cacheSizeLimit) {
            // Get the first (oldest) entry
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }
    }

    public clearCache() {
        this.cache.clear();
    }
}