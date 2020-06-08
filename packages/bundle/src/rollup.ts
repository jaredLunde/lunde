import path from 'path'
import * as rollup_ from 'rollup'
// @ts-ignore
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import {terser} from 'rollup-plugin-terser'
import sourcemaps from 'rollup-plugin-sourcemaps'
import gzipSize from 'gzip-size'
import brotliSize from 'brotli-size'
import prettyBytes from 'pretty-bytes'
import {pascalCase, camelCase} from 'change-case'
import chalk from 'chalk'
import type {
  RollupOptions,
  InputOptions,
  OutputOptions,
  ModuleFormat,
} from 'rollup'
import {getPkgJson, log, success} from './utils'
import {babelConfig} from './babel'
import type {LundleOutput, LundleConfig} from './types'

const isBareModuleId = (id: string) =>
  !id.startsWith('.') && !id.includes(path.join(process.cwd(), 'modules'))

export const rollup = async (options: LundleRollupOptions = {}) => {
  let {
    config,
    output = {
      umd: ['unpkg', 'umd:main', 'umd'],
      esm: ['import'],
    },
    format,
    exportName,
    umdCase = 'pascal',
    source,
    react,
    watch,
  } = options
  let sizeInfo: Promise<string>[] = []
  const configOverrides = config?.rollup
  const {value: pkg, filename} = getPkgJson()

  if (!filename || !pkg) {
    console.error(
      'Failed to find a package.json file near the working directory'
    )
    process.exit(1)
  }

  const root = path.dirname(filename)
  const bundles: Promise<any>[] = []
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

        outputs.push({
          type: outputType,
          source: path.isAbsolute(srcFile) ? srcFile : path.join(root, srcFile),
          file: (path.isAbsolute(file) ? file : path.join(root, file)).replace(
            /(\.[\w]+)$/,
            '.dev$1'
          ),
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

      outputs.push({
        type: outputType,
        source: path.isAbsolute(srcFile) ? srcFile : path.join(root, srcFile),
        file: (path.isAbsolute(file) ? file : path.join(root, file)).replace(
          /\.([\w]+)$/,
          '.dev$1'
        ),
      })
    }
  }

  for (const output of outputs) {
    const isReact =
      react === void 0 ? !!output.source.match(/\.(jsx|tsx)$/) : react
    const globals: Record<string, string> = isReact
      ? {
          react: 'React',
          'react-dom': 'ReactDOM',
        }
      : {}

    const inputOptions: InputOptions = {
      input: output.source,
      treeshake: {
        propertyReadSideEffects: false,
      },
      plugins: [
        json(),
        sourcemaps(),
        resolve({
          mainFields: ['source', 'browser', 'module', 'main'],
          extensions: jsExtensions,
        }),
        babel({
          exclude: ['**/test/**', '**/*.test.{js,jsx,ts,tsx}'],
          extensions: jsExtensions,
          babelHelpers: 'bundled',
          ...babelConfig(output.type, {
            react: isReact,
            typescript: !!output.source.match(/\.tsx?$/),
          }),
          sourceMaps: true,
          rootMode: 'upward',
        }),
        commonjs({
          include: /\/node_modules\//,
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        !/(\.dev\.[\w]+)/.test(output.file) &&
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
        // Credit: https://github.com/developit/microbundle/blob/master/src/index.js
        {
          writeBundle(options, bundle) {
            sizeInfo.push(
              Promise.all(
                Object.values(bundle).map((chunk) => {
                  if (chunk.type !== 'chunk') return
                  if (chunk.code) {
                    return getSizeInfo(chunk.code, chunk.fileName, false)
                  }
                })
              ).then(
                (results) =>
                  `  ${chalk.bold(output.type)}\n` +
                  results.filter(Boolean).join('\n')
              )
            )
          },
        },
        // ...plugins,
      ],
      external: output.type === 'esm' ? isBareModuleId : Object.keys(globals),
    }

    if (!outputs.length) return

    const outputOptions: OutputOptions = {
      name: (umdCase !== 'pascal' ? camelCase : pascalCase)(
        path.basename(output.file).split('.')[0]
      ),
      file: output.file,
      format: output.type,
      sourcemap: true,
      globals,
    }

    let finalConfig: RollupOptions = {
      ...inputOptions,
      output: [outputOptions],
    }

    if (typeof configOverrides === 'function') {
      finalConfig = configOverrides(finalConfig, {
        ...options,
        type: output.type,
      })
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
      success(`[rollup] ${chalk.bold(output.type)} building`)
      const rollupOutputs: OutputOptions[] = Array.isArray(finalConfig.output)
        ? finalConfig.output
        : [finalConfig.output as OutputOptions]
      const {...input} = finalConfig
      delete input.output
      bundles.push(
        rollup_
          .rollup(input)
          .then((bundle) =>
            Promise.all(rollupOutputs.map((out) => bundle.write(out)))
          )
      )
    }
  }

  if (bundles.length) {
    await Promise.all(bundles)
    const sizes = await Promise.all(sizeInfo)
    success(`[rollup] bundle size\n${sizes.join('\n')}`)
  }
}

const jsExtensions = [
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.es',
  '.es6',
  '.ts',
  '.tsx',
]

// Credit: https://github.com/developit/microbundle/blob/master/src/index.js
const formatSize = (
  size: number,
  filename: string,
  type: 'br' | 'gz',
  raw: boolean
) => {
  const pretty = raw ? `${size} B` : prettyBytes(size)
  const color =
    size < 5000 ? chalk.green : size > 40000 ? chalk.red : chalk.yellow
  return `${' '.repeat(10 - pretty.length)}${color(pretty)}: ${chalk.white(
    path.basename(filename)
  )}.${type}`
}

const getSizeInfo = async (code: string, filename: string, raw: boolean) => {
  const gzip = formatSize(
    await gzipSize(code),
    filename,
    'gz',
    raw || code.length < 5000
  )
  let brotli
  //wrap brotliSize in try/catch in case brotli is unavailable due to
  //lower node version
  try {
    brotli = formatSize(
      await brotliSize(code),
      filename,
      'br',
      raw || code.length < 5000
    )
  } catch (e) {
    return gzip
  }

  return gzip + '\n' + brotli
}

export interface LundleRollupOptions {
  config?: LundleConfig
  output?: {
    // string[]
    [type in RollupOutputTypes]?: string[]
  }
  format?: RollupOutputTypes
  exportName?: string
  umdCase?: 'pascal' | 'camel'
  source?: string
  watch?: boolean
  react?: boolean
  env?: 'production' | 'development' | 'test'
}

export type RollupOutputTypes = ModuleFormat
