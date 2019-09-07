import fs from 'fs'
import path from 'path'
import aws from 'aws-sdk'
import mime from 'mime'
import isGzip from 'is-gzip'
import readChunk from 'read-chunk'
import chalk from 'chalk'
import {pascalCase, isUpperCase} from 'change-case'
import ora from 'ora'
import isPlainObject from 'is-plain-object'
import webpack from 'webpack'
import minimatch from 'minimatch'
import deepMerge from 'deepmerge'

function getCredentials(credentials = {}) {
  if (credentials.accessKeyId) {
    return new aws.Credentials(
      credentials.accessKeyId,
      credentials.secretAccessKey,
      credentials.sessionToken || null
    )
  }

  if (credentials.profile === void 0 && process.env.AWS_PROFILE) {
    credentials.profile = process.env.AWS_PROFILE
  }

  return new aws.SharedIniFileCredentials(credentials)
}

function getReadStream(filename, opt) {
  const stream = fs.createReadStream(filename, opt)
  stream.on('error', err => {
    if (err) {
      throw err
    }
  })

  return stream
}

function transformParams(params) {
  if (isPlainObject(params)) {
    const out = {}

    Object.keys(params).forEach(key => {
      out[isUpperCase(key.charAt(0)) ? key : pascalCase(key)] =
        key.toLowerCase() === 'metadata'
          ? params[key]
          : transformParams(params[key])
    })

    return out
  } else if (Array.isArray(params)) {
    return params.map(transformParams)
  }

  return params
}

// replaces [filename] [basename] [file] [ext] [dirname] for
// more customizable and granular key names
function fillPlaceholders(key, filename, replacements = {}) {
  const ext = path.extname(filename)
  key = key
    .replace('[filename]', filename)
    .replace('[basename]', path.basename(filename))
    .replace('[file]', path.basename(filename, ext))
    .replace('[ext]', ext)
    .replace('[dirname]', path.dirname(filename))
  Object.keys(replacements).forEach(
    k => (key = key.replace(`[${k}]`, replacements[k]))
  )
  return key.replace(/^\//, '')
}

async function uploadToS3(
  assets,
  {outputPath, credentials, object, bucket, params = {}}
) {
  const filenames = Array.isArray(assets)
    ? assets.map(asset => asset.name)
    : Object.keys(assets)
  const s3 = new aws.S3({credentials: getCredentials(credentials), ...params})
  const uploads = []

  filenames.forEach(filename => {
    // opens up a file stream from the local file
    const absoluteName = path.join(outputPath, filename)
    // ignores cleaned files
    if (fs.existsSync(absoluteName) === false) return
    // gets the config for this type of file
    let config = {
      key: '[filename]',
      params: {},
    }

    if (object) {
      for (let glob in object) {
        if (glob === '*' || minimatch(filename, glob, {dot: true}) === true) {
          config = deepMerge(config, object[glob])
          break
        }
      }

      if (config.exclude === true) {
        return
      }
    }

    // creates the params object for upload()
    const params = {
      Bucket: bucket.name,
      Prefix: bucket.prefix,
      Body: getReadStream(absoluteName),
      ...transformParams(config.params),
      Key: fillPlaceholders(config.key, filename),
      ContentType:
        config.params.contentType === 'auto' ||
        config.params.contentType === void 0
          ? mime.getType(filename)
          : config.params.contentType,
    }

    // prepares gzipped content with proper Content-Encoding header
    if (
      !params.ContentEncoding &&
      isGzip(readChunk.sync(absoluteName, 0, 1024))
    ) {
      params.ContentEncoding = 'gzip'
    }

    // start the upload
    uploads.push(s3.upload(params).promise())
  })

  return Promise.all(uploads)
}

async function emptyBucket({bucket, credentials, params = {}}) {
  const s3 = new aws.S3({credentials: getCredentials(credentials), ...params})
  let removals = [],
    ContinuationToken
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let response

    try {
      response = await s3
        .listObjectsV2({
          Bucket: bucket.name,
          Prefix: bucket.prefix,
        })
        .promise()

      response.Contents.forEach(({Key}) =>
        removals.push(s3.deleteObject({Key, Bucket: bucket.name}).promise())
      )
    } catch (err) {
      console.log('[Error]', err)
      break
    }

    ContinuationToken = response && response.NextContinuationToken

    if (!ContinuationToken) {
      break
    }
  }

  return Promise.all(removals)
}

module.exports = class ServerlessPlugin {
  constructor(serverless, options) {
    this.name = 'serverless-sync-bundle'
    this.serverless = serverless
    this.servicePath = serverless.config.servicePath
    this.options = options
    this.spinner = ora({spinner: 'dots3', color: 'gray'})
    this.bundles = []
    this.commands = {
      bundle: {
        usage: 'Bundles code for your web application',
        lifecycleEvents: ['build'],
      },
      'sync-bundle': {
        usage: 'Builds and deploys your code to S3',
        lifecycleEvents: ['sync'],
      },
      'clean-bundle': {
        usage: 'Empties the S3 buckets referenced in the config',
        lifecycleEvents: ['clean'],
      },
    }

    // https://gist.github.com/HyperBrain/50d38027a8f57778d5b0f135d80ea406
    this.hooks = {
      // runs before deploying
      'after:package:setupProviderConfiguration': this.bundleAll,
      // runs after deploying on `sls deploy`
      'before:deploy:finalize': this.syncAll,
      // runs before `sls deploy -f [func]`
      'after:deploy:function:initialize': this.bundleAndSyncAll,
      // runs before `sls remove`
      'before:remove:remove': this.emptyAll,
      // command hooks
      'bundle:build': this.bundleAll,
      'sync-bundle:sync': this.bundleAndSyncAll,
      'clean-bundle:clean': this.emptyAll,
    }
  }

  get config() {
    return this.serverless.service?.custom?.bundle
  }

  getConfig(webpackConfigFile) {
    return {
      credentials: {
        profile: this.serverless.service?.provider?.profile,
      },
      ...this.config[webpackConfigFile],
    }
  }

  log(msg) {
    this.serverless.cli.log(msg, this.name)
  }

  bundleAndSyncAll = () => this.bundleAll().then(this.syncAll)

  syncAll = async () => {
    for (let bundle of this.bundles) {
      await this.sync(bundle)
    }
  }

  bundleAll = async () => {
    this.bundles = []

    for (let configFile in this.config) {
      this.bundles.push(await this.bundle(configFile))
    }
  }

  emptyAll = async () => {
    for (let configFile in this.config) {
      await this.empty(configFile)
    }
  }

  bundle = async webpackConfigFile => {
    let webpackConfig = require(path.join(this.servicePath, webpackConfigFile))
    webpackConfig = Array.isArray(webpackConfig)
      ? webpackConfig
      : [webpackConfig]
    const config = this.getConfig(webpackConfigFile)

    // builds the bundle in Webpack
    let stats = []
    for (let cfg of webpackConfig) {
      this.spinner.start(`${chalk.bold(cfg.name)} ${chalk.gray('building')}`)
      const compiler = webpack(cfg)
      stats.push(
        await new Promise(resolve =>
          compiler.run((err, stats) => {
            if (err || stats.hasErrors()) {
              this.spinner.fail(chalk.bold('Compilation error'))
              throw stats.compilation.errors.join('\n\n')
            }

            this.spinner.stop()
            // passes any Webpack warnings to the user
            if (stats.compilation.warnings.length) {
              console.log('\n')
              for (let warning of stats.compilation.warnings) {
                console.log(
                  chalk.yellow(`Webpack warning`),
                  warning.message,
                  '\n'
                )
              }
            }

            this.spinner.succeed(
              `${chalk.bold(cfg.name)} ${chalk.gray('build succeeded')}`
            )
            resolve(stats)
          })
        )
      )
    }

    return {stats, webpackConfig, config}
  }

  sync = async ({stats, webpackConfig, config}) => {
    for (let i = 0; i < webpackConfig.length; i++) {
      this.spinner.start(
        `${chalk.bold(webpackConfig[i].name)} ${chalk.gray('uploading')}`
      )
      await uploadToS3(stats[i].compilation.assets, {
        outputPath: webpackConfig[i].output.path,
        ...config,
      })
      this.spinner.succeed(
        `${chalk.bold(webpackConfig[i].name)} ${chalk.gray('uploaded')}`
      )
    }
  }

  empty = async webpackConfigFile => {
    // Empties the s3 bucket unless retained
    const config = this.getConfig(webpackConfigFile)

    if (!config.bucket?.retain) {
      this.spinner.start(`Emptying ${chalk.bold(config.bucket.name)}...`)
      await emptyBucket(config)
      this.spinner.succeed(`Emptied ${chalk.bold(config.bucket.name)}`)
    }
  }
}
