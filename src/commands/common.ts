import { IConfig } from './../configuration';
import { ExtensionKey } from './../constants';
'use strict';
import { commands, Disposable, TextDocumentShowOptions, TextEditor, TextEditorEdit, Uri, ViewColumn, window, workspace } from 'vscode';
import { Logger } from '../logger';
import { AlwaysOpenInColumn } from '../configuration';

export enum Commands {
    Show = 'findrelated.show',
    OpenFirst = 'findrelated.open-first',
    CloseRelated = 'findrelated.close'
}

const MAX_COLUMNS = 3;

export abstract class EditorCommand extends Disposable {

    private _disposable: Disposable;

    constructor(command: Commands) {
        super(() => this.dispose());
        this._disposable = commands.registerTextEditorCommand(command, this.execute, this);
    }

    dispose() {
        this._disposable && this._disposable.dispose();
    }

    abstract execute(editor: TextEditor, edit: TextEditorEdit, ...args: any[]): any;

    getColumnToOpenIn(
        currentEditorColumn: number | null = null,
        alwaysOpenInColumn: AlwaysOpenInColumn = 'auto',
        maxColumns = MAX_COLUMNS
    ): ViewColumn {

        if (alwaysOpenInColumn !== 'auto') {
            const isInvalidColumn = (
                alwaysOpenInColumn > 3 ||
                alwaysOpenInColumn < 1 ||
                alwaysOpenInColumn === 'active'
            );

            return isInvalidColumn
            ? ViewColumn.Active
            : alwaysOpenInColumn as (1 | 2 | 3);
        }

        if (currentEditorColumn) {
            // The viewColumn is 1-based, so we subtract 1 to have it easier

            // add 1 to the index to get the next editor, make sure it is still
            // in the range of allowed columns
            // add 1 because the columns are 1-based
            return currentEditorColumn <= maxColumns
            ? (currentEditorColumn % maxColumns) + 1
            : ViewColumn.One;
        }

        return ViewColumn.Active;
    }

    getConfig() {
        return workspace.getConfiguration().get<IConfig>(ExtensionKey) || {
            autoOpen: false,
            openPreview: true,
            inColumn: false,
            maxColumns: MAX_COLUMNS,
            alwaysOpenInColumn: 'auto'
        };
    }
}

export async function openEditor(uri: Uri, options?: TextDocumentShowOptions): Promise<TextEditor | undefined> {
    try {
        const defaults: TextDocumentShowOptions = {
            preserveFocus: false,
            preview: true,
            viewColumn: (window.activeTextEditor && window.activeTextEditor.viewColumn) || 1
        };

        const document = await workspace.openTextDocument(uri);
        return window.showTextDocument(document, { ...defaults, ...(options || {}) });
    }
    catch (ex) {
        Logger.error(ex, 'openEditor');
        return undefined;
    }
}
