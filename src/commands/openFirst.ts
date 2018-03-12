'use strict';
import { Arrays } from '../system';
import { ExtensionContext, TextDocument, TextEditor, TextEditorEdit, Uri, window, workspace } from 'vscode';
import { Commands, EditorCommand, openEditor } from './common';
import { Logger } from '../logger';
import { RelatedQuickPick } from '../quickPicks';
import { IRule, RulesProvider } from '../rulesProvider';
import * as path from 'path';

const pathNormalizer = /\\/g;
function normalizePath(fileName: string) {
    return fileName.replace(pathNormalizer, '/');
}

export class OpenFirstRelatedCommand extends EditorCommand {

    constructor(context: ExtensionContext, private rulesProvider: RulesProvider) {
        super(Commands.OpenFirst);
    }

    async execute(editor: TextEditor, edit: TextEditorEdit) {
        if (!editor || !editor.document || editor.document.isUntitled) return undefined;

        const fileName = normalizePath(workspace.asRelativePath(editor.document.fileName));

        const placeHolder = `files related to ${path.basename(fileName)} \u00a0\u2022\u00a0 ${path.dirname(fileName)}`;
        const progressCancellation = RelatedQuickPick.showProgress(placeHolder);

        try {
            const activeRules = this.rulesProvider.provideRules(fileName);
            if (!activeRules.length) return undefined;

            const cfg = this.getConfig();

            const currentEditorColumn = window.activeTextEditor
            ? window.activeTextEditor.viewColumn || 1
            : null;

            const viewColumn = this.getColumnToOpenIn(
                currentEditorColumn,
                cfg.alwaysOpenInColumn,
                Math.min(window.visibleTextEditors.length, cfg.maxColumns)
            );

            if (progressCancellation.token.isCancellationRequested) return undefined;

            const uris = await this.getRelatedFiles(activeRules, fileName, editor.document);
            if (!uris || !uris.length) return undefined;

            if (progressCancellation.token.isCancellationRequested) return undefined;

            const openOptions = {
                preview: cfg.openPreview,
                viewColumn: cfg.inColumn ? viewColumn : undefined
            };

            return await openEditor(uris[0], openOptions);
        }
        catch (ex) {
            Logger.error(ex, 'OpenFirstRelatedCommand');
            return window.showErrorMessage(`Unable to open first related file. See output channel for more details`);
        }
        finally {
            progressCancellation.dispose();
        }
    }

    private async getRelatedFiles(rules: IRule[], fileName: string, document: TextDocument): Promise<Uri[] | undefined> {
        const files = await Promise.all<Uri[]>(this.rulesProvider.resolveRules(rules, fileName, document, workspace.rootPath));
        if (!files.length) return undefined;

        return Arrays.flatten(files.map(_ => _.filter(uri => uri.fsPath !== fileName)));
    }
}
