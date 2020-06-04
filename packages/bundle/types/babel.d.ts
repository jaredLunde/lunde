import type {PluginItem} from '@babel/core'
import type {ModuleFormat} from 'rollup'
import type {LundleConfig} from './types'
export declare const babel: (options?: LundleBabelOptions) => Promise<void>
export declare const babelConfig: (
  type: BabeConfigTypes,
  options?: BabelConfigOptions
) => BabelConfig
export interface LundleBabelOptions {
  config?: LundleConfig
  output?: {
    [type in BabelOutputTypes]?: string[]
  }
  format?: BabelOutputTypes
  exportName?: string
  source?: string
  watch?: boolean
  react?: boolean
}
export interface BabelConfigOptions {
  typescript?: boolean
  react?: boolean
  presets?: PluginItem[]
  plugins?: PluginItem[]
}
export declare type BabelConfig = {
  presets: PluginItem[] | null
  plugins: PluginItem[] | null
}
export declare type BabelOutputTypes = ModuleFormat
export declare type BabeConfigTypes = BabelOutputTypes | 'umd'
