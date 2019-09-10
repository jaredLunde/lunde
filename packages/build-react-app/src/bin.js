#!/usr/bin/env node
import chalk from 'chalk'
import yargs from 'yargs'
import {log, flag, pwd, getPkgJson} from '@inst-cli/template-utils'
import path from 'path'
import webpack from 'webpack'
import ora from 'ora'
import serve_ from './serve'

yargs.scriptName('build-react-app')

yargs.command(
  'serve [-p|--prod] [-s|--stage stage] [--host host] [--port port] [--assets assets] [--config config]',
  'Starts the nearest React app in a micro server',
  yargs => {
    yargs.option('prod', {
      alias: 'p',
      describe: `Serves in the production NODE_ENV. Otherwise defaults to process.env.NODE_ENV || "development"`,
      type: 'boolean',
    })

    yargs.option('stage', {
      alias: 's',
      describe: `The stage to build in your app for. Defaults to process.env.STAGE.`,
      type: 'string',
    })

    yargs.option('host', {
      type: 'string',
      describe: 'A hostname to run your server on. Defaults to ::.',
    })

    yargs.option('port', {
      type: 'number',
      describe: 'The port number to run your server on. Defaults to 3000.',
    })

    yargs.option('assets', {
      type: 'string',
      describe:
        'A path to public assets outside of and not handled by Webpack in your project.',
    })

    yargs.option('config', {
      type: 'string',
      describe: 'A path to a Webpack config. Defaults to webpack.config.js.',
    })
  }
)

yargs.command(
  'build [-p|--prod] [-t|--target] [-s|--stage stage] [-c|--config config]',
  'Bundles the nearest React app',
  yargs => {
    yargs.option('prod', {
      alias: 'p',
      describe: `Builds in the production NODE_ENV. Otherwise defaults to process.env.NODE_ENV || "development"`,
      type: 'boolean',
    })

    yargs.option('target', {
      alias: 't',
      describe: `Sets a BUILD_ENV environment variable for your build target, either 'static' or 'node'. Defaults to 'static'.`,
      type: 'string',
    })

    yargs.option('stage', {
      alias: 's',
      describe: `The stage to build in your app for. Defaults to process.env.STAGE.`,
      type: 'string',
    })

    yargs.option('config', {
      alias: 'c',
      type: 'string',
      describe: 'A path to a Webpack config. Defaults to webpack.config.js.',
    })
  }
)

const args = yargs.argv

// the command is the first argument
const [cmd] = args._

function logDone() {
  log(chalk.grey('done'))
}

// routes the cmd
switch (cmd) {
  case 'serve':
    serve(args)
    break
  case 'build':
    build(args).then(logDone)
    break
  default:
    log(
      flag('Error', 'red'),
      cmd ? 'command not found:' : 'No command was provided.',
      cmd ? `"${cmd}".` : '',
      'See --help for a list of commands.'
    )
}

function serve({prod, stage, host = '::', port, assets, config}) {
  const pkgJson = getPkgJson(pwd())
  process.env.BUILD_ENV = 'server'
  process.env.NODE_ENV = prod
    ? 'production'
    : process.env.NODE_ENV || 'development'
  process.env.STAGE = stage || process.env.STAGE
  config = require(config ||
    path.join(path.dirname(pkgJson.__path), 'webpack.config.js'))

  return serve_({
    // dev webpack client config
    clientConfig: config.find(v => v.name === 'client'),
    // dev webpack server config
    serverConfig: config.find(v => v.name === 'server'),
    // path to local public assets
    publicAssets: assets,
    // micro-dev options
    silent: false,
    host,
    port: port || 3000,
  })
}

async function build({prod, stage, target, config}) {
  const pkgJson = getPkgJson(pwd())
  process.env.BUILD_ENV = target || 'static'
  process.env.NODE_ENV = prod
    ? 'production'
    : process.env.NODE_ENV || 'development'
  process.env.STAGE = stage || process.env.STAGE
  const configPath =
    config || path.join(path.dirname(pkgJson.__path), 'webpack.config.js')
  const configs = require(configPath)
  // find() below ensures the configs are compiled in the correct order so
  // server has access to the stats file of client
  for (let config of [
    configs.find(v => v.name === 'client'),
    configs.find(v => v.name === 'server'),
  ]) {
    await new Promise(resolve => {
      const name = chalk.bold(config.name)
      const spinner = ora({spinner: 'dots3', color: 'gray'}).start(
        `${name} ${chalk.gray('building')}`
      )

      try {
        webpack([config]).run((err, stats) => {
          if (err || stats.hasErrors()) {
            spinner.stop()

            if (err) {
              console.log(chalk.red(`[${name} error]`))
              console.log(err)
            }

            if (stats.stats[0].compilation.errors.length) {
              console.log(chalk.red(`[${name} error]`))
              console.log(stats.stats[0].compilation.errors.join('\n\n'))
            }

            spinner.fail(`${name} ${chalk.gray('build failed')}`)
          } else {
            spinner.succeed(`${name} ${chalk.gray('build succeeded')}`)
          }

          resolve()
        })
      } catch (err) {
        console.log(chalk.red(`[${name} error]`))
        console.log(err)
        spinner.fail(`${name} ${chalk.gray('build failed')}`)
      }
    })
  }
}
