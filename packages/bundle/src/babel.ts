import fs from 'fs'
import path from 'path'
import {transformFileAsync} from '@babel/core'
import type {PluginItem} from '@babel/core'
import chalk from 'chalk'
import chokidar from 'chokidar'
import rimraf from 'rimraf'
import getIn from 'lodash.get'
import minimatch from 'minimatch'
import {getPkgJson, walk, cwd, log, success, error, loadConfig} from './utils'
import type {ChokidarListener} from './types'

export const babel = async (options: LundleBabelOptions = {}) => {
  const {
    output = {
      cjs: ['main', 'default'],
      module: ['module', 'browser'],
      esm: ['import'],
    },
    source,
    watch,
    react,
  } = options
  const {value: pkg, filename} = getPkgJson()
  const watchers: [string, ChokidarListener][] = []

  if (filename) {
    const root = path.dirname(filename)
    const configOverrides = (await loadConfig())?.babel
    const transforms: ReturnType<typeof transform>[] = []

    for (const outputType in output) {
      const field = output[outputType as BabelOutputTypes] as string[]
      let outIndexFile: string | undefined

      for (const fieldName of field) {
        outIndexFile =
          getIn(pkg, ['exports', '.', fieldName]) || getIn(pkg, fieldName)
        if (outIndexFile) break
      }

      // Skip empty fields
      if (!field || !outIndexFile) continue

      const srcFile =
        getIn(pkg, ['exports', '.', 'source']) || getIn(pkg, 'source')
      const outDir = path.join(root, path.dirname(outIndexFile))
      const srcDir = path.join(
        root,
        source || srcFile ? path.dirname(srcFile) : 'src'
      )
      const srcFiles = (await walk(srcDir))
        .filter(minimatch.filter('*.{js,ts,jsx,tsx}', {matchBase: true}))
        .filter(minimatch.filter('!*.d.ts', {matchBase: true}))
        .filter(minimatch.filter('!*.test.*', {matchBase: true}))
        .filter(minimatch.filter('!**/test/**', {matchBase: true}))
        .filter(
          minimatch.filter('!**/__{fixtures,test,tests,mocks,snapshots}__/**', {
            matchBase: true,
          })
        )

      transforms.push(
        transform(
          {
            srcFiles,
            srcDir,
            root,
            outputType: outputType as BabelOutputTypes,
            react,
            outDir,
            outIndexFile,
            configOverrides,
          },
          options
        )
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
                    outputType: outputType as BabelOutputTypes,
                    react,
                    outDir,
                    outIndexFile: outIndexFile as string,
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
                        path.extname(outIndexFile as string)
                      )
                    )
                  ),
                  () => {
                    error('[ʙᴀʙᴇʟ]', chalk.bold(outputType), 'deleted', file)
                  }
                )
                break
            }
          },
        ])
      }
    }

    await Promise.all(transforms)
    // Initializes the watcher
    if (watch) {
      console.log('')
      log('[ʙᴀʙᴇʟ] watching for changes...')

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
          ? configOverrides(finalBabelConfig, babelOptions)
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
    `[ʙᴀʙᴇʟ] ${chalk.bold(outputType)} ` +
      (writtenFiles.length > 1
        ? `compiled ${writtenFiles.length} files`
        : `compiled ${srcFiles[0]}`)
  )
}

export const babelConfig = (
  type: BabeConfigTypes,
  options: BabelConfigOptions = {}
): BabelConfig => {
  const esm = type === 'esm'
  const module = type === 'module'
  const umd = type === 'umd'

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
                '> 0.5%, ie >= 11, safari >= 9, firefox >= 43, ios >= 8',
            }
          : {
              node: esm ? '12' : '10',
            },
      },
      devExpression: options.typescript === false,
      restSpread: !umd,
      objectAssign: !umd,
      typescript: options.typescript === void 0 || options.typescript,
    },
  ]

  return {
    presets: [
      options.react && ['@babel/preset-react', {useSpread: !umd}],
      presetEnv,
    ].filter(Boolean),
    plugins: [options.react && 'optimize-react', 'annotate-pure-calls'].filter(
      Boolean
    ),
  } as BabelConfig
}

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

export type BabelConfig = {
  presets: PluginItem[] | null
  plugins: PluginItem[] | null
}

export type BabelOutputTypes = 'esm' | 'module' | 'cjs'
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
    options: LundleBabelOptions
  ) => BabelConfig
}
