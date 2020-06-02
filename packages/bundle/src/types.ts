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

export type ChokidarListener = (
  eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir',
  path: string,
  stats?: Stats
) => void
