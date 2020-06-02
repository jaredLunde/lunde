import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import chalk from 'chalk'
import chokidar from 'chokidar'
import rimraf from 'rimraf'
import getIn from 'lodash.get'
import minimatch from 'minimatch'
import {getPkgJson, walk, cwd, log, success, error, loadConfig} from './utils'
import type {ChokidarListener} from './types'

export const tsc = async (options: LundleTscOptions = {}) => {
  let {
    configFile = 'tsconfig.json',
    output = {
      types: ['types', 'typings'],
    },
    watch,
  } = options
  configFile = path.isAbsolute(configFile)
    ? configFile
    : path.join(cwd(), configFile)
  const {value: pkg, filename} = getPkgJson()
  const watchers: [string, ChokidarListener][] = []

  if (filename) {
    const root = path.dirname(filename)
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

    for (const outputType in output) {
      const field = output[outputType as TscOutputTypes] as string[]
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

      compile([srcFile], {
        ...(configOverrides ? configOverrides(tsConfig, options) : tsConfig),
        declaration: true,
        emitDeclarationOnly: true,
        outDir,
      })

      return
    }
  }
}

const compile = (
  fileNames: string[],
  compilerOptions: ts.CompilerOptions & {outDir: string},
  options: CompileOptions = {}
): void => {
  const {deleteDirOnStart = true} = options
  // Create a Program with an in-memory emit
  const createdFiles: Record<string, string> = {}
  const host = ts.createCompilerHost(compilerOptions)
  deleteDirOnStart && rimraf.sync(compilerOptions.outDir)
  host.writeFile = (fileName: string, contents: string) =>
    (createdFiles[fileName] = contents)

  // Prepare and emit the d.ts files
  const program = ts.createProgram(fileNames, compilerOptions, host)
  program.emit()

  // Loop through all the input files
  fileNames.forEach((file) => {
    console.log('### JavaScript\n')
    console.log(host.readFile(file))

    console.log('### Type Definition\n')
    const dts = file.replace('.js', '.d.ts')
    console.log(createdFiles)
  })
}

export interface CompileOptions {
  deleteDirOnStart?: boolean
}
/*
// Run the compiler
compile(process.argv.slice(2), {
  allowJs: true,
  declaration: true,
  emitDeclarationOnly: true,
})
*/

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
