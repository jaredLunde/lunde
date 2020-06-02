/// <reference types="node" />
import type {Stats} from 'fs'
import type {RollupOptions} from 'rollup'
import type {CompilerOptions} from 'typescript'
import type {LundleRollupOptions} from './rollup'
import type {LundleTscOptions} from './tsc'
import type {BabelConfig, LundleBabelOptions} from './babel'
export interface LundleConfig {
  babel?: (config: BabelConfig, options: LundleBabelOptions) => BabelConfig
  rollup?: (
    config: RollupOptions,
    options: LundleRollupOptions
  ) => RollupOptions
  tsc?: (config: CompilerOptions, options: LundleTscOptions) => CompilerOptions
}
export interface LundleOutput<OutputTypes> {
  type: OutputTypes
  source: string
  file: string
}
export declare type ChokidarListener = (
  eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir',
  path: string,
  stats?: Stats
) => void
