import path from 'path'
import * as rollup_ from 'rollup'
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
  ModuleFormat,
} from 'rollup'
import {getPkgJson, log, success, loadConfig} from './utils'
import {babelConfig} from './babel'
import type {LundleOutput} from './types'

export const rollup = async (options: LundleRollupOptions = {}) => {
  let {
    output = {
      umd: ['unpkg', 'umd:main', 'umd'],
    },
    format,
    exportName,
    source,
    react,
    watch,
  } = options
  const configOverrides = (await loadConfig())?.rollup
  const {value: pkg, filename} = getPkgJson()

  if (!filename || !pkg) {
    console.error(
      'Failed to find a package.json file near the working directory'
    )
    process.exit(1)
  }

  const root = path.dirname(filename)
  const bundles: Promise<RollupOutput>[] = []
  const outputs: LundleOutput<RollupOutputTypes>[] = []
  const hasExportsField = !!pkg.exports

  if (format) {
    const formats = format.split(',').map((s) => s.trim())
    output = formats.reduce((current, format) => {
      // @ts-ignore
      if (output[format]) current[format] = output[format]
      return current
    }, {})
  }

  const exportNames = exportName
    ? exportName.split(',').map((s) => s.trim())
    : []

  if (hasExportsField) {
    for (const outputType_ in output) {
      const outputType = outputType_ as RollupOutputTypes
      const outputFields = output[outputType] as string[]

      // Package.json contains an export field so we'll search for
      // our fields in those first
      for (const exportPath in pkg.exports) {
        if (exportNames.length > 0 && !exportNames.includes(exportPath))
          continue
        const exports = pkg.exports[exportPath]
        let file: string | undefined

        for (const fieldName of outputFields) {
          file = exports[fieldName]
          if (file) break
        }

        // Skip empty fields
        if (!file) continue

        const srcFile = source || exports.source || pkg.source

        if (!srcFile) {
          console.error('[rollup] could not find a source file for', outputType)
          process.exit(1)
        }

        outputs.push({
          type: outputType,
          source: path.isAbsolute(srcFile) ? srcFile : path.join(root, srcFile),
          file: path.isAbsolute(file) ? file : path.join(root, file),
        })
      }
    }
  }

  if (!outputs.length && !exportNames.length) {
    for (const outputType_ in output) {
      const outputType = outputType_ as RollupOutputTypes
      const outputFields = output[outputType] as string[]
      // No exports field, search for singular field names in package.json
      let file: string | undefined

      for (const fieldName of outputFields) {
        file = pkg[fieldName]
        if (file) break
      }

      // Bails if no file was found
      if (!file) continue
      const srcFile = source || pkg.source

      if (!srcFile) {
        console.error('[rollup] could not find a source file for', outputType)
        process.exit(1)
      }

      outputs.push({
        type: outputType,
        source: path.isAbsolute(srcFile) ? srcFile : path.join(root, srcFile),
        file: path.isAbsolute(file) ? file : path.join(root, file),
      })
    }
  }

  for (const output of outputs) {
    const isReact =
      react === void 0 ? !!output.source.match(/\.(jsx|tsx)$/) : react
    const inputOptions: InputOptions = {
      input: output.source,
      plugins: [
        json(),
        resolve({
          mainFields: ['source', 'browser', 'module', 'main'],
          extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
        }),
        babel({
          exclude: ['**/test/**', '**/*.test.{js,jsx,ts,tsx}'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          babelHelpers: 'bundled',
          ...babelConfig(output.type, {
            react: isReact,
            typescript: !!output.source.match(/\.tsx?$/),
          }),
        }),
        commonjs(),
        replace({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
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
      external: isReact ? ['react'] : [],
    }

    if (!outputs.length) return

    const outputOptions: OutputOptions = {
      name: pascalCase(path.basename(output.file).split('.')[0]),
      file: output.file,
      format: output.type,
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
      log('[rollup] watching for changes...')
      rollup_.watch({
        ...finalConfig,
        watch: {
          buildDelay: 500,
        },
      })
    } else {
      success('[rollup] building', output.type)
      const rollupOutputs: OutputOptions[] = Array.isArray(finalConfig.output)
        ? finalConfig.output
        : [finalConfig.output as OutputOptions]
      const {...input} = finalConfig
      delete input.output
      const bundle = await rollup_.rollup(input)
      bundles.push(...rollupOutputs.map((out) => bundle.write(out)))
    }
  }

  if (bundles.length) {
    await Promise.all(bundles)
  }
}

export interface LundleRollupOptions {
  output?: {
    // string[]
    [type in RollupOutputTypes]?: string[]
  }
  format?: RollupOutputTypes
  exportName?: string
  source?: string
  watch?: boolean
  react?: boolean
  env?: 'production' | 'development' | 'test'
}

export type RollupOutputTypes = ModuleFormat
