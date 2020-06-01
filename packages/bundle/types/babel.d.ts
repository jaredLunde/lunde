import type {PluginItem} from '@babel/core'
export declare const babel: (options?: LundleBabelOptions) => Promise<void>
export declare const babelConfig: (
  type: BabeConfigTypes,
  options?: BabelConfigOptions
) => BabelConfig
export interface LundleBabelOptions {
  output?: {
    [type in BabelOutputTypes]?: string[]
  }
  source?: string
  watch?: boolean
  react?: boolean
}
export interface BabelConfigOptions {
  typescript?: boolean
  react?: boolean
}
export declare type BabelConfig = {
  presets: PluginItem[] | null
  plugins: PluginItem[] | null
}
export declare type BabelOutputTypes = 'esm' | 'module' | 'cjs'
export declare type BabeConfigTypes = BabelOutputTypes | 'umd'
