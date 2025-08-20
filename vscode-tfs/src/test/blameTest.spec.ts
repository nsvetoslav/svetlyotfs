import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { BlameManager } from '../TFS/BlameManager';
import { BlameDecorationsProvider } from '../vscode/BlameDecorationsProvider';

// Import mocha types
import 'mocha';

suite('Blame Feature Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('BlameManager instance creation', () => {
        const blameManager = BlameManager.getInstance();
        assert.ok(blameManager);
    });

    test('BlameDecorationsProvider instance creation', () => {
        const decorationsProvider = BlameDecorationsProvider.getInstance();
        assert.ok(decorationsProvider);
    });

    test('BlameManager isEnabled', () => {
        const blameManager = BlameManager.getInstance();
        // By default, the blame feature should be enabled
        assert.strictEqual(blameManager.isEnabled(), true);
    });
});