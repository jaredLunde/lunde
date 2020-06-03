export declare const tsc: (options?: LundleTscOptions) => Promise<void>
export interface CompileOptions {
  checkOnly?: boolean
  configFile?: string
}
export interface LundleTscOptions {
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
