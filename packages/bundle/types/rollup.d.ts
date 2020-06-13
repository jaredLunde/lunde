import type { ModuleFormat } from 'rollup';
import type { LundleConfig } from './types';
export declare const rollup: (options?: LundleRollupOptions) => Promise<void>;
export interface LundleRollupOptions {
    config?: LundleConfig;
    output?: {
        [type in RollupOutputTypes]?: string[];
    };
    format?: RollupOutputTypes;
    exportName?: string;
    umdCase?: 'pascal' | 'camel';
    source?: string;
    watch?: boolean;
    react?: boolean;
    env?: 'production' | 'development' | 'test';
}
export declare type RollupOutputTypes = ModuleFormat;
