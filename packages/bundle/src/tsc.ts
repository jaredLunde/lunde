import path from 'path'
import chalk from 'chalk'
import rimraf from 'rimraf'
import {getPkgJson, cwd, flag} from './utils'
import type {LundleOutput} from './types'

export const tsc = async (options: LundleTscOptions = {}) => {
  let {
    configFile = 'tsconfig.json',
    output = {
      types: ['types', 'typings'],
    },
    format,
    exportName,
    watch,
    checkOnly,
    source,
  } = options
  configFile = path.isAbsolute(configFile)
    ? configFile
    : path.join(cwd(), configFile)
  const {value: pkg, filename} = getPkgJson()

  if (!filename || !pkg) {
    console.error(
      'Failed to find a package.json file near the working directory'
    )
    process.exit(1)
  }

  const root = path.dirname(filename)
  const outputs: LundleOutput<TscOutputTypes>[] = []
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
      const outputType = outputType_ as TscOutputTypes
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
          console.error('[tsc] could not find a source file for', outputType)
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

  if (!outputs.length && !exportNames.length) {
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
        console.error('[tsc] could not find a source file for', outputType)
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

  if (!outputs.length) return

  for (const output of outputs) {
    const outDir = path.join(root, path.dirname(output.file))

    const program = compile(
      // TypeScript is provided like this so that we don't need it as
      // a hard dependency. Projects w/o TypeScript should still be able
      // to use this script.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('typescript'),
      [output.source],
      {
        deleteDirOnStart: !watch,
        emitDeclarationOnly: !checkOnly,
        declaration: true,
        noEmit: checkOnly,
        outDir,
      },
      {
        checkOnly,
        configFile,
        watching: watch,
      }
    )

    if (!watch) {
      program.close()
    }
  }
}

const compile = (
  ts: typeof import('typescript'),
  fileNames: string[],
  compilerOptions: import('typescript').CompilerOptions & {outDir: string},
  options: CompileOptions
) => {
  const {
    watching = false,
    checkOnly = false,
    configFile = 'tsconfig.json',
  } = options
  !checkOnly && rimraf.sync(compilerOptions.outDir)
  const configPath = ts.findConfigFile(cwd(), ts.sys.fileExists, configFile)

  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.")
  }

  // TypeScript can use several different program creation "strategies":
  //  * ts.createEmitAndSemanticDiagnosticsBuilderProgram,
  //  * ts.createSemanticDiagnosticsBuilderProgram
  //  * ts.createAbstractBuilder
  // The first two produce "builder programs". These use an incremental strategy
  // to only re-check and emit files whose contents may have changed, or whose
  // dependencies may have changes which may impact change the result of prior
  // type-check and emit.
  // The last uses an ordinary program which does a full type check after every
  // change.
  // Between `createEmitAndSemanticDiagnosticsBuilderProgram` and
  // `createSemanticDiagnosticsBuilderProgram`, the only difference is emit.
  // For pure type-checking scenarios, or when another tool/process handles emit,
  // using `createSemanticDiagnosticsBuilderProgram` may be more desirable.
  const createProgram = checkOnly
    ? ts.createSemanticDiagnosticsBuilderProgram
    : ts.createSemanticDiagnosticsBuilderProgram

  // Note that there is another overload for `createWatchCompilerHost` that takes
  // a set of root files.
  const host = ts.createWatchCompilerHost(
    configPath,
    compilerOptions,
    ts.sys,
    createProgram,
    (diagnostic) => {
      console.error(diagnosticToWarning(ts, null, diagnostic))
    },
    (diagnostic, newLine, options, errorCount) => {
      console.log(diagnosticToWarning(ts, null, diagnostic))
      // Only exits outside of watch mode
      if (errorCount && !watching) process.exit(1)
    }
  )

  // `createWatchProgram` creates an initial program, watches files, and updates
  // the program over time.
  return ts.createWatchProgram(host)
}

// Credit to Rollup.js
// https://github.com/rollup/plugins/blob/master/packages/typescript/src/diagnostics/toWarning.ts
function diagnosticToWarning(
  ts: typeof import('typescript'),
  host: import('typescript').FormatDiagnosticsHost | null,
  diagnostic: import('typescript').Diagnostic
) {
  const flattenedMessage = ts.flattenDiagnosticMessageText(
    diagnostic.messageText,
    '\n'
  )

  if (diagnostic.file) {
    // Add information about the file location
    const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      diagnostic.start!
    )
    const code = `${category(diagnostic)} ${chalk.gray(
      `TS${diagnostic.code}`
    )}: ${flattenedMessage}`

    let message = `${chalk.cyan(
      path.relative(cwd(), diagnostic.file.fileName)
    )}:${chalk.yellow(line)}:${chalk.yellow(character)} - ${code}`

    if (host) {
      // Extract a code frame from Typescript
      const formatted = ts.formatDiagnosticsWithColorAndContext(
        [diagnostic],
        host
      )
      // Typescript only exposes this formatter as a string prefixed with the flattened message.
      // We need to remove it here since Rollup treats the properties as separate parts.
      let frame = formatted.slice(
        formatted.indexOf(flattenedMessage) + flattenedMessage.length
      )
      const newLine = host.getNewLine()
      if (frame.startsWith(newLine)) {
        frame = frame.slice(frame.indexOf(newLine) + newLine.length)
      }

      message += frame
    }

    return message + '\n'
  } else {
    return diagnostic.category == 3
      ? `${flag('✎')} [tsc] ${flattenedMessage.replace(' in watch mode', '')}`
      : `${category(diagnostic)} ${chalk.gray(
          'TS' + diagnostic.code
        )}: ${flattenedMessage}`
  }
}

const category = (diagnostic: import('typescript').Diagnostic) => {
  /*
  Warning = 0,
  Error = 1,
  Suggestion = 2,
  Message = 3
  */
  const {category} = diagnostic
  return chalk[DIAGNOSTIC_COLOR[category]](DIAGNOSTIC_CATEGORY[category])
}

const DIAGNOSTIC_CATEGORY = ['warning', 'error', 'suggestion', '']
const DIAGNOSTIC_COLOR = ['yellow', 'red', 'blue', 'gray'] as const
export interface CompileOptions {
  checkOnly?: boolean
  configFile?: string
  watching?: boolean
}

export interface LundleTscOptions {
  configFile?: string
  output?: {
    [type in TscOutputTypes]?: string[]
  }
  format?: TscOutputTypes
  exportName?: string
  source?: string
  watch?: boolean
  checkOnly?: boolean
}

export type TscOutputTypes = 'types'
