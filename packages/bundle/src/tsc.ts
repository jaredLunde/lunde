import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import chokidar from 'chokidar'
import rimraf from 'rimraf'
import {getPkgJson, cwd, log, success, loadConfig} from './utils'
import type {ChokidarListener, LundleOutput} from './types'

export const tsc = async (options: LundleTscOptions = {}) => {
  let {
    configFile = 'tsconfig.json',
    output = {
      types: ['types', 'typings'],
    },
    watch,
    source,
  } = options
  configFile = path.isAbsolute(configFile)
    ? configFile
    : path.join(cwd(), configFile)
  const {value: pkg, filename} = getPkgJson()
  const watchers: [string, ChokidarListener][] = []

  if (!filename || !pkg) {
    console.error(
      'Failed to find a package.json file near the working directory'
    )
    process.exit(1)
  }

  const configOverrides = (await loadConfig())?.tsc
  const {config: tsConfig, error: tsConfigError} = ts.readConfigFile(
    configFile,
    () => {
      return fs.readFileSync(configFile, 'utf8')
    }
  )
  // Bails if there was an error reading the config file
  if (tsConfigError) {
    console.error(tsConfigError)
    process.exit(1)
  }

  const root = path.dirname(filename)
  const outputs: LundleOutput<TscOutputTypes>[] = []
  const hasExportsField = !!pkg.exports

  if (hasExportsField) {
    for (const outputType_ in output) {
      const outputType = outputType_ as TscOutputTypes
      const outputFields = output[outputType] as string[]
      // Package.json contains an export field so we'll search for
      // our fields in those first
      for (const exportPath in pkg.exports) {
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
          console.error('[𝙩𝙨𝙘] could not find a source file for', outputType)
          process.exit(1)
        }

        outputs.push({
          type: outputType,
          source: path.isAbsolute(srcFile) ? srcFile : path.join(root, srcFile),
          // These really should be relative paths, unlike rollup/babel
          file,
        })
      }
    }
  }

  if (!outputs.length) {
    for (const outputType_ in output) {
      const outputType = outputType_ as TscOutputTypes
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
        // These really should be relative paths, unlike rollup/babel
        file,
      })
    }
  }

  for (const output of outputs) {
    const srcDir = path.dirname(output.source)
    const outDir = path.join(root, path.dirname(output.file))

    compile([output.source], {
      ...(configOverrides ? configOverrides(tsConfig, options) : tsConfig),
      declaration: true,
      emitDeclarationOnly: true,
      outDir,
    })

    if (watch) {
      watchers.push([
        srcDir,
        (event) => {
          switch (event) {
            case 'change':
            case 'add':
              compile([output.source], {
                ...(configOverrides
                  ? configOverrides(tsConfig, options)
                  : tsConfig),
                declaration: true,
                emitDeclarationOnly: true,
                outDir,
              })
              log(`[𝙩𝙨𝙘] compiled`, output.type)
              break
          }
        },
      ])
    }

    success(`[𝙩𝙨𝙘] compiled`, output.type)
  }

  // Initializes the watcher
  if (watch) {
    log('[𝙩𝙨𝙘] watching for changes...')

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

const compile = async (
  fileNames: string[],
  compilerOptions: ts.CompilerOptions & {outDir: string},
  options: CompileOptions = {}
) => {
  const {deleteDirOnStart = true} = options
  // Create a Program with an in-memory emit
  const host = ts.createCompilerHost(compilerOptions)
  deleteDirOnStart && rimraf.sync(compilerOptions.outDir)
  const writtenDirs = new Set<string>()

  host.writeFile = async (filename: string, contents: string) => {
    const dirname = path.dirname(filename)

    if (!writtenDirs.has(dirname)) {
      await fs.promises.mkdir(dirname, {recursive: true})
      writtenDirs.add(dirname)
    }

    return fs.promises.writeFile(filename, contents)
  }
  // Prepare and emit the d.ts files
  const program = ts.createProgram(fileNames, compilerOptions, host)
  program.emit()
}

export interface CompileOptions {
  deleteDirOnStart?: boolean
}

export interface LundleTscOptions {
  configFile?: string
  output?: {
    [type in TscOutputTypes]?: string[]
  }
  source?: string
  watch?: boolean
  react?: boolean
}

export type TscOutputTypes = 'types'
