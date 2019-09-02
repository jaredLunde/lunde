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
  'serve [env] [-h|--host host] [-p|--port port] [-a|--assets assets] [-c|--config config]',
  'Starts the nearest React app in a micro server',
  yargs => {
    yargs.positional('env', {
      alias: 'e',
      describe:
        `The node environment to start the app in. If not provided, this will default to ` +
        `process.env.NODE_ENV || "development".`,
      type: 'string',
    })

    yargs.option('host', {
      alias: 'h',
      type: 'string',
      describe: 'A hostname to run your server on. Defaults to ::.',
    })

    yargs.option('port', {
      alias: 'p',
      type: 'number',
      describe: 'The port number to run your server on. Defaults to 3000.',
    })

    yargs.option('assets', {
      alias: 'a',
      type: 'string',
      describe:
        'A path to public assets outside of and not handled by Webpack in your project.',
    })

    yargs.option('config', {
      alias: 'c',
      type: 'string',
      describe: 'A path to a Webpack config. Defaults to webpack.config.js.',
    })
  }
)

yargs.command(
  'build [env] [-s|--stage stage] [-c|--config config]',
  'Bundles the nearest React app',
  yargs => {
    yargs.positional('env', {
      alias: 'e',
      describe:
        `The node environment to build the app in. If not provided, this will default to  ` +
        `process.env.NODE_ENV || "development".`,
      type: 'string',
    })

    yargs.option('stage', {
      alias: 's',
      describe: `The stage to build in your app for. Defaults to process.env.STAGE || "development".`,
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

function serve({env, stage, host = '::', port, assets, config}) {
  const pkgJson = getPkgJson(pwd())
  process.env.BUILD_ENV = 'server'
  process.env.NODE_ENV = env || process.env.NODE_ENV || 'development'
  process.env.STAGE = stage || process.env.STAGE || 'development'
  config = require(config || path.join(path.dirname(pkgJson.__path), 'webpack.config.js'))

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

async function build({env, stage, config}) {
  const pkgJson = getPkgJson(pwd())
  process.env.BUILD_ENV = 'static'
  process.env.NODE_ENV = env || process.env.NODE_ENV || 'development'
  process.env.STAGE = stage || process.env.STAGE || 'development'
  const configPath = config || path.join(path.dirname(pkgJson.__path), 'webpack.config.js')
  const configs = require(configPath)
  // find() below ensures the configs are compiled in the correct order so
  // server has access to the stats file of client
  for (let config of [
    configs.find(v => v.name === 'client'),
    configs.find(v => v.name === 'server'),
  ]) {
    await new Promise(resolve => {
      const name = chalk.bold(config.name)
      const spinner = ora({spinner: 'point'}).start(`Building ${name}`)

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

            spinner.fail(`${name} build failed`)
          } else {
            spinner.succeed(`${name} build succeeded`)
          }

          resolve()
        })
      } catch (err) {
        console.log(chalk.red(`[${name} error]`))
        console.log(err)
        spinner.fail(`${name} build failed`)
      }
    })
  }
}
