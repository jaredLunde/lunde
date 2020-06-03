import yargs from 'yargs'
import {babel} from './babel'
import {rollup} from './rollup'
import {tsc} from './tsc'
import {log, error} from './utils'

export const bin = async () => {
  log('== ʟᴜɴᴅʟᴇ ==')
  yargs.scriptName('lundle')

  yargs.command(
    'build [-i|--input] [-e|--export] [-f|--format] [-c|--config] [-w|--watch] [--react] [--cwd]',
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

      yargs.option('cwd', {
        describe: 'Changes the current working directory used during the build',
        string: true,
      })
    }
  )

  yargs.command(
    'check-types [-i|--input] [-e|--export] [-c|--config] [-w|--watch] [--cwd]',
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

      yargs.option('cwd', {
        describe: 'Changes the current working directory used during the build',
        string: true,
      })
    }
  )

  const args = yargs.argv

  // the command is the first argument
  const [cmd] = args._
  console.log(args)

  // routes the cmd
  switch (cmd) {
    case 'build':
      babel({watch: !!args.watch}).catch((err) => {
        error('[𝙗𝙖𝙗𝙚𝙡] compilation error\n')
        console.error(err)
        process.exit(1)
      })

      rollup({watch: !!args.watch}).catch((err) => {
        error('[𝙧𝙤𝙡𝙡𝙪𝙥] compilation error\n')
        console.error(err)
        process.exit(1)
      })

      tsc({watch: !!args.watch}).catch((err) => {
        error('[𝙩𝙨𝙘] compilation error\n')
        console.error(err)
        process.exit(1)
      })
      break
    case 'check-types':
      await tsc({watch: true}).catch((err) => {
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
