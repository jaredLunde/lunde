import path from 'path'
import * as rollup_ from 'rollup'
import getIn from 'lodash.get'
// @ts-ignore
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import {terser} from 'rollup-plugin-terser'
import {pascalCase} from 'change-case'
import type {
  RollupOptions,
  InputOptions,
  OutputOptions,
  RollupOutput,
} from 'rollup'
import {getPkgJson, log, success, loadConfig} from './utils'
import {babelConfig} from './babel'

// @ts-ignore
global.document = global.document || {}

export const rollup = async (options: LundleRollupOptions = {}) => {
  // log('[ʀᴏʟʟᴜᴘ]')
  const {
    output = {
      umd: ['unpkg', 'umd:main', 'umd'],
    },
    source,
    react,
    env = 'production',
    watch,
  } = options
  const configOverrides = (await loadConfig())?.rollup
  const {value: pkg, filename} = getPkgJson()

  if (filename) {
    const bundles: Promise<RollupOutput>[] = []

    for (const outputType_ in output) {
      const outputType = outputType_ as RollupOutputTypes
      const field = output[outputType] as string[]
      let outFile: string | undefined

      for (const fieldName of field) {
        outFile =
          getIn(pkg, ['exports', '.', fieldName]) || getIn(pkg, fieldName)
        if (outFile) break
      }

      // Skip empty fields
      if (!field || !outFile) continue

      const srcFile =
        source || getIn(pkg, ['exports', '.', 'source']) || getIn(pkg, 'source')

      if (!srcFile) {
        console.error('[ʀᴏʟʟᴜᴘ] could not find a source file')
        process.exit(1)
      }

      const isReact = react === void 0 ? !!srcFile.match(/\.(jsx|tsx)$/) : react
      const inputOptions: InputOptions = {
        input: srcFile,
        plugins: [
          json(),
          resolve({
            mainFields: ['source', 'browser', 'module', 'main'],
            extensions: ['.mjs', '.js', '.ts', '.tsx'],
          }),
          babel({
            exclude: ['**/test/**', '**/*.test.{js,jsx,ts,tsx}'],
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            babelHelpers: 'bundled',
            ...babelConfig(outputType as RollupOutputTypes, {
              react: isReact,
              typescript: !!srcFile.match(/\.(ts|tsx)$/),
            }),
          }),
          commonjs(),
          replace({
            'process.env.NODE_ENV': JSON.stringify(env),
          }),
          terser({
            output: {comments: false},
            compress: {
              booleans_as_integers: true,
              hoist_funs: true,
              keep_fargs: false,
              passes: 2,
              unsafe_comps: true,
              unsafe_math: true,
              unsafe_undefined: true,
            },
          }),
          // ...plugins,
        ],
        external: [],
      }

      const outputOptions: OutputOptions = {
        name: pascalCase(path.basename(outFile).split('.')[0]),
        file: outFile,
        format: outputType,
        globals: isReact
          ? {
              react: 'React',
              'react-dom': 'ReactDOM',
            }
          : {},
      }

      let finalConfig: RollupOptions = {
        ...inputOptions,
        output: [outputOptions],
      }

      if (typeof configOverrides === 'function') {
        finalConfig = configOverrides(finalConfig, options)
      }

      if (watch) {
        log('[ʀᴏʟʟᴜᴘ] watching for changes...')
        rollup_.watch({
          ...finalConfig,
          watch: {
            buildDelay: 500,
          },
        })
      } else {
        const output: OutputOptions[] = Array.isArray(finalConfig.output)
          ? finalConfig.output
          : [finalConfig.output as OutputOptions]
        const {...input} = finalConfig
        delete input.output
        const bundle = await rollup_.rollup(input)
        bundles.push(...output.map((out) => bundle.write(out)))
      }
    }

    await Promise.all(bundles)
    success('[ʀᴏʟʟᴜᴘ] built')
  }
}

export interface LundleRollupOptions {
  output?: {
    [type in RollupOutputTypes]?: string[]
  }
  source?: string
  watch?: boolean
  react?: boolean
  env?: 'production' | 'development' | 'test'
}

export type RollupOutputTypes = Extract<OutputOptions['format'], 'string'>
