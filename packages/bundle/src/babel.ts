import fs from 'fs'
import path from 'path'
import {transformFileAsync} from '@babel/core'
import type {PluginItem} from '@babel/core'
import chalk from 'chalk'
import chokidar from 'chokidar'
import rimraf from 'rimraf'
import minimatch from 'minimatch'
import type {ModuleFormat} from 'rollup'
import {getPkgJson, walk, cwd, log, success, error} from './utils'
import type {ChokidarListener, LundleOutput, LundleConfig} from './types'

export const babel = async (options: LundleBabelOptions = {}) => {
  let {
    config,
    output = {
      cjs: ['main', 'require', 'default'],
      module: ['module', 'browser'],
    },
    format,
    exportName,
    source,
    watch,
    react,
  } = options
  const {value: pkg, filename} = getPkgJson()

  if (!filename || !pkg) {
    console.error(
      'Failed to find a package.json file near the working directory'
    )
    process.exit(1)
  }

  const root = path.dirname(filename)
  const outputs: LundleOutput<BabelOutputTypes>[] = []
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
      const outputType = outputType_ as BabelOutputTypes
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
          console.error('[babel] could not find a source file for', outputType)
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
    for (const outputType_ in outputs) {
      const outputType = outputType_ as BabelOutputTypes
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
        console.error('[𝙩𝙨𝙘] could not find a source file for', outputType)
        process.exit(1)
      }

      outputs.push({
        type: outputType,
        source: path.isAbsolute(srcFile) ? srcFile : path.join(root, srcFile),
        file: path.isAbsolute(file) ? file : path.join(root, file),
      })
    }
  }

  if (!outputs.length) return

  const watchers: [string, ChokidarListener][] = []
  const configOverrides = config?.babel
  const transforms: ReturnType<typeof transform>[] = []

  for (const output of outputs) {
    const outDir = path.dirname(output.file)
    const srcDir = path.dirname(output.source)

    transforms.push(
      walk(srcDir).then((srcFiles) => {
        srcFiles = srcFiles
          .filter(minimatch.filter('*.{js,ts,jsx,tsx}', {matchBase: true}))
          .filter(minimatch.filter('!*.d.ts', {matchBase: true}))
          .filter(minimatch.filter('!*.test.*', {matchBase: true}))
          .filter(minimatch.filter('!**/test/**', {matchBase: true}))
          .filter(
            minimatch.filter(
              '!**/__{fixtures,test,tests,mocks,snapshots}__/**',
              {
                matchBase: true,
              }
            )
          )

        return transform(
          {
            srcFiles,
            srcDir,
            root,
            outputType: output.type,
            react,
            outDir,
            outIndexFile: output.file,
            configOverrides,
          },
          options
        )
      })
    )

    if (watch) {
      watchers.push([
        srcDir,
        (event, file) => {
          switch (event) {
            case 'change':
            case 'add':
              transform(
                {
                  srcFiles: [file],
                  srcDir,
                  root,
                  outputType: output.type,
                  react,
                  outDir,
                  outIndexFile: output.file,
                  deleteDirOnStart: false,
                  configOverrides,
                },
                options
              )
              break

            case 'unlink':
              rimraf(
                path.join(
                  outDir,
                  path.relative(
                    srcDir,
                    file.replace(
                      new RegExp(`${path.extname(file)}$`),
                      path.extname(output.file)
                    )
                  )
                ),
                () => {
                  error('[babel]', chalk.bold(output.type), 'deleted', file)
                }
              )
              break
          }
        },
      ])
    }
  }

  if (transforms.length) {
    await Promise.all(transforms)
  }

  // Initializes the watcher
  if (watch) {
    log('[babel] watching for changes...')

    const watcher = chokidar.watch(
      Array.from(new Set(watchers.map(([srcDir]) => srcDir))),
      {
        cwd: cwd(),
        depth: 99,
        persistent: true,
        awaitWriteFinish: true,
        ignoreInitial: true,
      }
    )

    watcher.on('all', (event, file) => {
      if (!file.match(/\.[tj]sx?/)) return
      watchers
        .filter(([srcDir]) => !file.startsWith(srcDir))
        .forEach(([, callback]) => callback(event, file))
    })
  }
}

const transform = async (
  options: TransformOptions,
  babelOptions: LundleBabelOptions
) => {
  const {
    srcFiles,
    srcDir,
    root,
    outputType,
    react,
    outDir,
    outIndexFile,
    deleteDirOnStart = true,
    configOverrides,
  } = options
  const writtenDirs: string[] = []
  // Just bail if there aren't source files
  if (!srcFiles.length) return

  const files = []
  // Excludes tests and files that aren't js/ts
  for (const file of srcFiles) {
    const finalBabelConfig = babelConfig(outputType as BabelOutputTypes, {
      react: react === void 0 ? !!file.match(/\.(jsx|tsx)$/) : react,
      typescript: !!file.match(/\.(ts|tsx)$/),
    })

    files.push(
      transformFileAsync(file, {
        root,
        envName: outputType,
        ...(configOverrides
          ? configOverrides(finalBabelConfig, {
              ...babelOptions,
              type: outputType,
            })
          : finalBabelConfig),
      })
    )
  }

  const transformedFiles = await Promise.all(files)
  // Delete existing output directory if it hasn't already been written to
  let didWrite = false
  for (const dir in writtenDirs) {
    if (dir.startsWith(outDir)) didWrite = true
  }
  !didWrite && deleteDirOnStart && rimraf.sync(outDir)
  writtenDirs.push(outDir)

  const writtenFiles: ReturnType<typeof fs.promises.writeFile>[] = []

  for (let i = 0; i < transformedFiles.length; i++) {
    const babelResult = transformedFiles[i]
    const srcFile = srcFiles[i]

    if (babelResult) {
      const outFilename = path.join(
        outDir,
        path.relative(
          srcDir,
          srcFile.replace(
            new RegExp(`${path.extname(srcFile)}$`),
            path.extname(outIndexFile)
          )
        )
      )

      writtenFiles.push(
        fs.promises
          .mkdir(path.dirname(outFilename), {recursive: true})
          .then(() => {
            fs.promises.writeFile(outFilename, babelResult.code || '')
          })
      )
    }
  }

  await Promise.all(writtenFiles)
  success(
    `[babel] ${chalk.bold(outputType)} ` +
      (writtenFiles.length > 1
        ? `compiled ${writtenFiles.length} files`
        : `compiled ${srcFiles[0]}`)
  )
}

export const babelConfig = (
  type: BabeConfigTypes,
  options: BabelConfigOptions = {}
): BabelConfig => {
  const esm = ['es', 'esm'].includes(type)
  const module = ['module', 'systemjs', 'system'].includes(type)
  const umd = ['umd', 'amd', 'iife'].includes(type)
  const test = process.env.NODE_ENV === 'test' || ['test'].includes(type)

  const presetEnv = [
    '@lunde/es',
    {
      env: {
        modules: esm || module || umd ? false : 'commonjs',
        targets: module
          ? {
              browsers: 'cover 80% in US',
            }
          : umd
          ? {
              browsers:
                '> 0.5%, ie >= 11, safari >= 9, firefox >= 43, ios >= 8, not dead',
            }
          : esm
          ? {
              node: '12',
              browsers: [
                'Chrome >= 61',
                'Safari >= 10.1',
                'iOS >= 10.3',
                'Firefox >= 60',
                'Edge >= 16',
              ],
            }
          : {
              node: test ? 'current' : '10',
            },
      },
      devExpression: options.typescript === false,
      restSpread: umd,
      objectAssign: umd,
      typescript: options.typescript === void 0 || !!options.typescript,
    },
  ]

  return {
    presets: [
      options.react && ['@babel/preset-react', {useSpread: !umd}],
      presetEnv,
      ...(options.presets || []),
    ].filter(Boolean),
    plugins: [
      options.react && 'optimize-react',
      'annotate-pure-calls',
      ...(options.plugins || []),
    ].filter(Boolean),
  } as BabelConfig
}

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

export type BabelConfig = {
  presets: PluginItem[] | null
  plugins: PluginItem[] | null
}

export type BabelOutputTypes = ModuleFormat
export type BabeConfigTypes = BabelOutputTypes | 'umd'

interface TransformOptions {
  srcFiles: string[]
  srcDir: string
  root: string
  outputType: BabelOutputTypes
  react: boolean | undefined
  outDir: string
  outIndexFile: string
  deleteDirOnStart?: boolean
  configOverrides?: (
    config: BabelConfig,
    options: LundleBabelOptions & {type: BabelOutputTypes}
  ) => BabelConfig
}
