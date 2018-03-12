'use strict';
import { OutputLevel } from './logger';
import { IRuleset } from './rulesProvider';

export { ExtensionKey } from './constants';

export type AlwaysOpenInColumn = 'auto' | 'active' | 1 | 2 | 3;
export interface IConfig {
    debug: boolean;
    outputLevel: OutputLevel;
    rulesets: IRuleset[];
    workspaceRulesets: IRuleset[];
    applyRulesets: string[];
    applyWorkspaceRulesets: string[];
    autoOpen: boolean;
    openPreview: boolean;
    inColumn: boolean;
    maxColumns: number;
    alwaysOpenInColumn: AlwaysOpenInColumn;
}
