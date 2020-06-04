#!/usr/bin/env node
import yargs from 'yargs'
import {babel} from './babel'
import {rollup} from './rollup'
import {tsc} from './tsc'
import {loadConfig, error} from './utils'

export const bin = async () => {
  yargs.scriptName('lundle')

  yargs.command(
    'build [-i|--input] [-e|--export] [-f|--format] [-c|--config] [-w|--watch] [--tsconfig] [--react] [--cwd]',
    'Builds dist files for the project based upon the "exports" field in package.json',
    (yargs) => {
      yargs.option('input', {
        describe:
          'The source directory if not specifying a "source" field in the package.json',
        alias: 'i',
        string: true,
      })

      yargs.option('export', {
        describe:
          'Builds a specific path in the "exports" field of package.json, e.g. "."',
        alias: 'e',
        string: true,
      })

      yargs.option('format', {
        describe:
          'Builds a specific format in the "exports" field of package.json. Can be one of "module" | "cjs" | "es" | "esm" | "umd" | "amd" | "iife" | "system".',
        alias: 'f',
        string: true,
      })

      yargs.option('watch', {
        describe: 'Builds your dist files in "watch" mode',
        alias: 'w',
        boolean: true,
      })

      yargs.option('react', {
        describe:
          'Forces Babel to transpile with @babel/preset-react enabled. ' +
          'This happens automatically for files with "tsx" and "jsx" extensions.',
        boolean: true,
      })

      yargs.option('config', {
        describe:
          'A path to a lundle.config.js file. By default lundle searches in your project root.',
        alias: 'c',
        string: true,
      })

      yargs.option('tsconfig', {
        describe: 'A relative path to a tsconfig.json file..',
        string: true,
      })

      yargs.option('cwd', {
        describe: 'Changes the current working directory used during the build',
        string: true,
      })
    }
  )

  yargs.command(
    'check-types [-i|--input] [-e|--export] [-c|--config] [-w|--watch] [--tsconfig] [--cwd]',
    'Checks type definitions for the project',
    (yargs) => {
      yargs.option('input', {
        describe:
          'The source directory if not specifying a "source" field in the package.json',
        alias: 'i',
        string: true,
      })

      yargs.option('export', {
        describe:
          'Builds a specific path in the "exports" field of package.json, e.g. "."',
        alias: 'e',
        string: true,
      })

      yargs.option('watch', {
        describe: 'Builds your dist files in "watch" mode',
        alias: 'w',
        boolean: true,
      })

      yargs.option('config', {
        describe:
          'A path to a lundle.config.js file. By default lundle searches in your project root.',
        alias: 'c',
        string: true,
      })

      yargs.option('tsconfig', {
        describe: 'A relative path to a tsconfig.json file..',
        string: true,
      })

      yargs.option('cwd', {
        describe: 'Changes the current working directory used during the build',
        string: true,
      })
    }
  )

  const args = yargs.argv as
    | {
        _: ['build']
        $0: 'lundle'
        input: string
        export: string
        format: any
        react: boolean
        watch: boolean
        config: string
        tsconfig: string
        cwd: string
        cmd: 'build'
      }
    | {
        _: ['check-types']
        $0: 'lundle'
        input: string
        export: string
        format: any
        watch: boolean
        config: string
        tsconfig: string
        cwd: string
        cmd: 'check-types'
      }

  // the command is the first argument
  const [cmd] = args._
  // Weirdness for typescript
  args.cmd = cmd
  const config = await loadConfig()
  // routes the cmd
  switch (args.cmd) {
    case 'build':
      await tsc({
        config,
        configFile: args.tsconfig,
        format: args.format,
        exportName: args.export,
        watch: !!args.watch,
      }).catch((err) => {
        error('[𝙩𝙨𝙘] compilation error\n')
        console.error(err)
        process.exit(1)
      })

      await Promise.all([
        babel({
          config,
          format: args.format,
          exportName: args.export,
          react: args.react,
          watch: !!args.watch,
        }).catch((err) => {
          error('[𝙗𝙖𝙗𝙚𝙡] compilation error\n')
          console.error(err)
          process.exit(1)
        }),

        rollup({
          config,
          format: args.format,
          exportName: args.export,
          react: args.react,
          watch: !!args.watch,
        }).catch((err) => {
          error('[𝙧𝙤𝙡𝙡𝙪𝙥] compilation error\n')
          console.error(err)
          process.exit(1)
        }),
      ])
      break
    case 'check-types':
      await tsc({
        config,
        configFile: args.tsconfig,
        format: args.format,
        exportName: args.export,
        watch: args.watch,
        checkOnly: true,
      }).catch((err) => {
        error('[𝙩𝙨𝙘] compilation error\n')
        console.error(err)
        process.exit(1)
      })
      break
    default:
      error(
        cmd ? 'command not found:' : 'No command was provided.',
        cmd ? `"${cmd}".` : '',
        'See --help for a list of commands.'
      )
      process.exit(1)
  }
}

bin()
