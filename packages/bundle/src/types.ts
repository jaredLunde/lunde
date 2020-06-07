import type {Stats} from 'fs'
import type {RollupOptions} from 'rollup'
import type {LundleRollupOptions, RollupOutputTypes} from './rollup'
import type {TscOutputTypes} from './tsc'
import type {BabelConfig, BabelOutputTypes, LundleBabelOptions} from './babel'

export interface LundleConfig {
  babel?: (
    config: BabelConfig,
    options: LundleBabelOptions & {type: BabelOutputTypes}
  ) => BabelConfig
  rollup?: (
    config: RollupOptions,
    options: LundleRollupOptions & {type: RollupOutputTypes}
  ) => RollupOptions
  tsc?: (config: any, output: LundleOutput<TscOutputTypes>) => any
}

export interface LundleOutput<OutputTypes> {
  type: OutputTypes
  source: string
  file: string
}

export type ChokidarListener = (
  eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir',
  path: string,
  stats?: Stats
) => void
