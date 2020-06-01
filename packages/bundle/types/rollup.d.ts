import type {OutputOptions} from 'rollup'
export declare const rollup: (options?: LundleRollupOptions) => Promise<void>
export interface LundleRollupOptions {
  output?: {
    [type in RollupOutputTypes]?: string[]
  }
  source?: string
  watch?: boolean
  react?: boolean
  env?: 'production' | 'development' | 'test'
}
export declare type RollupOutputTypes = Extract<
  OutputOptions['format'],
  'string'
>
