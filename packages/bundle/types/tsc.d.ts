import type {LundleOutput, LundleConfig} from './types'
export declare const tsc: (options?: LundleTscOptions) => Promise<void>
export interface CompileOptions {
  checkOnly?: boolean
  configFile?: string
  watching?: boolean
  config?: LundleConfig
  output: LundleOutput<TscOutputTypes>
}
export interface LundleTscOptions {
  config?: LundleConfig
  configFile?: string
  output?: {
    [type in TscOutputTypes]?: string[]
  }
  format?: TscOutputTypes
  exportName?: string
  source?: string
  watch?: boolean
  checkOnly?: boolean
}
export declare type TscOutputTypes = 'types'
