import fs from 'fs'
import ip from 'ip'
import ora from 'ora'
import boxen from 'boxen'
import url from 'url'
import path from 'path'
import mime from 'mime'
import isGzip from 'is-gzip'
import chalk from 'chalk'
import rimraf from 'rimraf'
import micro, {run} from 'micro'
import microDev from 'micro-dev'
import https from 'https'
import {key, cert} from 'openssl-self-signed-certificate'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackHotServerMiddleware from 'webpack-hot-server-middleware'

function pipe() {
  let x,
    val,
    fns = [].slice.call(arguments)

  return function piped() {
    for (x = 0; x < fns.length; x++) {
      val = x === 0 ? fns[x].apply(null, arguments) : fns[x](val)
    }

    return val
  }
}

// TODO: HTTPS
// See https://github.com/gagle/node-ssl-self-signed-certificate/blob/master/lib/index.js
// eslint-disable-next-line no-unused-vars
const microHttps = fn =>
  https.createServer({key, cert}, (req, res) => run(req, res, fn))

const serveStatic = (route, localPath) => {
  if (!localPath) {
    return next => (...args) => next(...args)
  }

  return next => (req, res) => {
    let filename = url.parse(req.url).pathname

    if (filename.startsWith(route) === false) {
      return next(req, res)
    }

    filename = path.join(localPath, filename.replace(route, ''))

    if (fs.existsSync(filename)) {
      if (fs.statSync(filename).isDirectory()) {
        filename = path.join(filename, 'index.html')
      }

      let readStream = fs.createReadStream(filename)
      // handles any errors while reading
      readStream.on('error', () => res.end())
      // listens for data
      let streaming = false
      readStream.on('data', chunk => {
        if (streaming === false) {
          // sets the content-type header
          res.setHeader('Content-Type', mime.getType(filename))
          // brotli hack
          if (filename.endsWith('.br')) res.setHeader('Content-Encoding', 'br')
          // sets a gzip encoding header if it is compressed content
          if (isGzip(chunk)) res.setHeader('Content-Encoding', 'gzip')
          res.statusCode = 200
          streaming = true
        }
        // writes the chunk to the http response
        res.write(chunk)
      })
      // done being read
      readStream.on('close', () => res.end())
    } else {
      return next(req, res)
    }
  }
}

function createHandler(error, serverRenderer) {
  return function microHandler(req, res) {
    if (error) {
      throw error
    }

    return serverRenderer(req, res)
  }
}

export default ({
  clientConfig, // dev webpack client config
  serverConfig, // dev webpack server config
  publicAssets, // path to local public assets
  // micro-dev options
  silent = false,
  limit = '1mb',
  host = '::',
  port = 3000,
}) => {
  const spinner = ora({spinner: 'dots3', color: 'gray', isEnabled: false})
  const publicPath = clientConfig.output.publicPath || '/public/'

  // cleans the old files out of the dev directory
  rimraf.sync(clientConfig.output.path)
  rimraf.sync(serverConfig.output.path)

  // defines static asset locations and inits middleware
  let middleware = []

  // micro listener which is run after the compiler is done
  const startListening = handler => {
    return () => {
      if (
        process.env.NODE_ENV !== 'production' ||
        process.env.SSR_DEBUG === 'true'
      ) {
        spinner.stop()
        microDev({silent, limit, host, port})(handler)
      }

      if (
        process.env.NODE_ENV === 'production' &&
        process.env.SSR_DEBUG !== 'true'
      ) {
        spinner.stop()
        const server = micro(handler)
        server.listen(port, host, err => {
          if (err) {
            console.error('micro:', err.stack)
            process.exit(1)
          }

          if (silent === false) {
            const details = server.address()
            const ipAddress = ip.address()
            const url = `http://${ipAddress}:${details.port}`
            let message = chalk.bold('\n\nmicro ')
            message += chalk.green('production')
            message += '\n\n'

            host = host === '::' ? 'localhost' : host
            const localURL = `http://${host}:${details.port}`

            message += `${chalk.bold('Local           ')} ${localURL}\n`
            message += `${chalk.bold('On Your Network ')} ${url}\n\n`

            console.log(
              boxen(message, {
                padding: 2,
                borderColor: 'green',
                margin: 2,
              })
            )
          }
        })
      }
    }
  }

  if (process.env.NODE_ENV === 'production') {
    spinner.start(chalk.gray('building'))
    middleware.push(
      serveStatic(publicPath, publicAssets),
      serveStatic(publicPath, clientConfig.output.path)
    )

    // starts the webpack compilers
    webpack([clientConfig, serverConfig]).run((err, stats) => {
      if (err || stats.hasErrors()) {
        spinner.stop()

        if (err) {
          console.log(chalk.red('[SSR Error]'))
          console.log(err)
        }

        if (stats.stats[0].compilation.errors.length) {
          console.log(chalk.red('[Client Errors]'))
          console.log(stats.stats[0].compilation.errors.join('\n\n'))
        }

        if (stats.stats[1].compilation.errors.length) {
          console.log(chalk.red('[Server Errors]'))
          console.log(stats.stats[1].compilation.errors.join('\n\n'))
        }

        spinner.fail(chalk.gray('build failed'))
      } else {
        spinner.succeed(chalk.gray('build succeeded'))
        const [clientStats] = stats.toJson().children
        const serverPath = path.join(
          serverConfig.output.path,
          serverConfig.output.filename
        )
        const serverRenderer = require(serverPath).default
        // handler
        startListening(
          pipe.apply(null, middleware)(serverRenderer({clientStats}))
        )()
      }
    })
  } else {
    spinner.start(chalk.gray('building'))
    // boots up the client config with hot middleweare
    clientConfig.entry = [
      `webpack-hot-middleware/client?noInfo=false`,
      ...clientConfig.entry,
    ]
    // adds hot module replacement to the client plugins
    clientConfig.plugins = [
      new webpack.HotModuleReplacementPlugin(),
      ...clientConfig.plugins,
    ]

    // starts the webpack compilers
    const compiler = webpack([clientConfig, serverConfig])
    const [clientCompiler] = compiler.compilers

    // attaches dev middleware to the micro app
    const instance = webpackDevMiddleware(compiler, {
      publicPath,
      compress: true,
      historyApiFallback: true,
      disableHostCheck: true,
      serverSideRender: true,
      noInfo: true,
      logLevel: 'error',
    })
    const devMiddleware = next => (req, res) =>
      instance(req, res, () => next(req, res))
    const hmw = webpackHotMiddleware(clientCompiler)
    const hotMiddleware = next => (req, res) =>
      hmw(req, res, () => next(req, res))
    const hotServerMiddleware = webpackHotServerMiddleware(compiler, {
      reload: true,
      createHandler,
    })
    // taps into the webpack hook to start the micro app once it has finished
    // compiling
    middleware.push(devMiddleware, hotMiddleware)
    instance.waitUntilValid((...args) => {
      spinner.succeed(chalk.gray('build succeeded'))
      return startListening(pipe.apply(null, middleware)(hotServerMiddleware))(
        ...args
      )
    })
  }
}
