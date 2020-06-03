import type {ModuleFormat} from 'rollup'
export declare const rollup: (options?: LundleRollupOptions) => Promise<void>
export interface LundleRollupOptions {
  output?: {
    [type in RollupOutputTypes]?: string[]
  }
  format?: RollupOutputTypes
  exportName?: string
  source?: string
  watch?: boolean
  react?: boolean
  env?: 'production' | 'development' | 'test'
}
export declare type RollupOutputTypes = ModuleFormat
