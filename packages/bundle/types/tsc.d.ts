export declare const tsc: (options?: LundleTscOptions) => Promise<void>;
export interface CompileOptions {
    deleteDirOnStart?: boolean;
}
export interface LundleTscOptions {
    configFile?: string;
    output?: {
        [type in TscOutputTypes]?: string[];
    };
    source?: string;
    watch?: boolean;
    react?: boolean;
}
export declare type TscOutputTypes = 'types';
