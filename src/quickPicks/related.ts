'use strict';
import { CancellationTokenSource, QuickPickOptions, TextDocumentShowOptions, TextEditor, Uri, window, workspace } from 'vscode';
import { OpenFileCommandQuickPickItem, QuickPickItem, showQuickPickProgress } from './common';
import { Keyboard } from '../keyboard';
import * as path from 'path';

export class RelatedFileQuickPickItem extends OpenFileCommandQuickPickItem {

    showOptions: TextDocumentShowOptions;

    constructor(uri: Uri, showOptions?: TextDocumentShowOptions) {
        const directory = path.dirname(workspace.asRelativePath(uri));

        super(uri, {
            label: `$(file-symlink-file) ${path.basename(uri.fsPath)}`,
            description: directory === '.' ? '' : directory
        });

        this.showOptions = showOptions || {};
    }

    async execute(options: TextDocumentShowOptions = {}): Promise<TextEditor | undefined> {
        return super.execute({
            ...this.showOptions,
            ...options
        });
    }
}

export class RelatedQuickPick {

    static showProgress(placeHolder: string) {
        return showQuickPickProgress(placeHolder, undefined, true);
    }

    static async show(
        uris: Uri[],
        placeHolder: string,
        progressCancellation: CancellationTokenSource,
        showOptions?: TextDocumentShowOptions
    ): Promise<RelatedFileQuickPickItem | undefined> {
        const items = uris.map(uri => new RelatedFileQuickPickItem(uri, showOptions));

        const scope = await Keyboard.instance.beginScope();

        if (progressCancellation.token.isCancellationRequested) return undefined;

        progressCancellation.cancel();

        const pick = await window.showQuickPick(items, {
                matchOnDescription: true,
                placeHolder: placeHolder,
                onDidSelectItem: (item: QuickPickItem) => {
                    scope.setKeyCommand('right', item);
                    if (typeof item.onDidSelect === 'function') {
                        item.onDidSelect();
                    }
                }
            } as QuickPickOptions);

        await scope.dispose();

        return pick;
    }
}
