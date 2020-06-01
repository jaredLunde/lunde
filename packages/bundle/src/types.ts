import type {RollupOptions} from 'rollup'
import type {BabelConfig} from './babel'

export interface LundleConfig {
  babel?: (config: BabelConfig) => BabelConfig
  rollup?: (config: RollupOptions) => RollupOptions
}
