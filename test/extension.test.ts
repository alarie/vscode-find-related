import { ExtensionContext, ViewColumn } from 'vscode';
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { OpenFirstRelatedCommand } from '../src/commands/openFirst';

// Defines a Mocha test suite to group tests of similar kind together
suite('Find Related Tests', () => {

    const context: ExtensionContext = {
        extensionPath: '',
        subscriptions: [],
        workspaceState: {} as any,
        globalState: {} as any,
        asAbsolutePath: () => '',
        storagePath: ''
    };

    suite('OpenFirstRelatedCommand#getColumnToOpenIn', () => {
        test('should cycle through available columns', () => {
            const cmd = new OpenFirstRelatedCommand(context, {} as any);
            assert.equal(ViewColumn.Active, cmd.getColumnToOpenIn());
            assert.equal(ViewColumn.Two, cmd.getColumnToOpenIn(ViewColumn.One));
            assert.equal(ViewColumn.Three, cmd.getColumnToOpenIn(ViewColumn.Two));
            assert.equal(ViewColumn.One, cmd.getColumnToOpenIn(ViewColumn.Three));
        // });
        // test('should return active column if forced', () => {
        //     const cmd = new OpenFirstRelatedCommand(context, {} as any);
            assert.equal(ViewColumn.Active, cmd.getColumnToOpenIn(ViewColumn.Two, 'active'));
        // });
        // test('should return the specified column if forced', () => {
        //     const cmd = new OpenFirstRelatedCommand(context, {} as any);
            assert.equal(ViewColumn.Two, cmd.getColumnToOpenIn(ViewColumn.One, ViewColumn.Two));
            assert.equal(ViewColumn.Two, cmd.getColumnToOpenIn(ViewColumn.Two, ViewColumn.Two));
            assert.equal(ViewColumn.Two, cmd.getColumnToOpenIn(ViewColumn.Three, ViewColumn.Two));
        // });
        // test('should cycle through a subset of the columns', () => {
        //     const cmd = new OpenFirstRelatedCommand(context, {} as any);
            assert.equal(
                ViewColumn.One, cmd.getColumnToOpenIn(ViewColumn.Two, 'auto', 2),
                'activeCol 2 AND maxCols 2 => 1'
            );
            assert.equal(
                ViewColumn.Two, cmd.getColumnToOpenIn(ViewColumn.One, 'auto', 2),
                'activeCol 1 AND maxCols 2 => 2'
            );
            assert.equal(
                ViewColumn.One, cmd.getColumnToOpenIn(ViewColumn.Three, 'auto', 2),
                'activeCol 3 AND maxCols 2 => 1'
            );
        });
    });
});