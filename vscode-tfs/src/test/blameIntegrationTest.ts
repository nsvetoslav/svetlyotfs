import * as vscode from 'vscode';
import * as assert from 'assert';
import { BlameManager } from '../TFS/BlameManager';
import { BlameDecorationsProvider } from '../vscode/BlameDecorationsProvider';
import { TFSCommandExecutor } from '../TFS/Commands';

/**
 * Integration test for the blame feature
 */
export async function runBlameIntegrationTest() {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor found');
        return;
    }

    try {
        // Test BlameManager
        const blameManager = BlameManager.getInstance();
        assert.ok(blameManager, 'BlameManager should be instantiated');
        assert.strictEqual(typeof blameManager.isEnabled(), 'boolean', 'isEnabled should return a boolean');

        // Test BlameDecorationsProvider
        const decorationsProvider = BlameDecorationsProvider.getInstance();
        assert.ok(decorationsProvider, 'BlameDecorationsProvider should be instantiated');

        // Test TFSCommandExecutor
        const tfsExecutor = TFSCommandExecutor.getInstance();
        assert.ok(tfsExecutor, 'TFSCommandExecutor should be instantiated');

        // Show success message
        vscode.window.showInformationMessage('Blame feature integration test passed!');
    } catch (error: any) {
        vscode.window.showErrorMessage(`Blame feature integration test failed: ${error.message}`);
        console.error('Blame feature integration test failed:', error);
    }
}