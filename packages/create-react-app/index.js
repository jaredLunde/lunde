const os = require('os')
const path = require('path')
const AWS = require('aws-sdk')
const {
  required,
  error,
  trim,
  autocompleteIni,
} = require('@inst-cli/template-utils')

const doesBucketExist = async (profile, bucket) => {
  const s3 = new AWS.S3({
    credentials: new AWS.SharedIniFileCredentials({profile}),
  })

  try {
    await s3.headBucket({Bucket: bucket}).promise()
    return true
  } catch (error) {
    if (error.statusCode === 404) {
      return false
    } else if (error.statusCode === 403) {
      return true
    }

    throw error
  }
}

const sortByKeys = obj =>
  Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})

module.exports = {}
const CREDENTIALS_FILE = path.join(os.homedir(), '.aws/credentials')
// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object
// examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, // default template variables
  args, // the arguments passed to the CLI
  packageJson, // contents of the package.json file as a plain object
  inquirer // the inquirer prompt object
) => {
  const prompts = []

  if (args.aws) {
    let bucketExists = false
    inquirer.registerPrompt(
      'confirm-validated',
      require('inquirer-confirm-validated')
    )

    prompts.push(
      autocompleteIni(inquirer, CREDENTIALS_FILE, {
        name: 'PROFILE',
        message: `AWS profile`,
        default: 'default',
        filter: trim,
        validate: required,
      }),
      {
        name: 'DOMAIN',
        message: `Domain name`,
        filter: trim,
        validate: required,
      },
      {
        name: 'S3_BUCKET',
        message: `Static assets S3 bucket`,
        default: `${PKG_NAME}-public`,
        filter: trim,
        validate: function(input, a) {
          if (required(input) === false) return false

          const done = this.async()
          doesBucketExist(a.PROFILE, input).then(exists => {
            bucketExists = exists
            done(null, true)
          })
        },
        when: !args.static,
      },
      {
        name: 'S3_BUCKET_EXISTS',
        type: 'confirm-validated',
        message: `This S3 bucket already exists. Do you want to continue?`,
        default: true,
        when: () => !args.static && bucketExists,
        validate: input => {
          if (input === false) process.exit(0)
          return true
        },
      },
      {
        name: 'DEPLOYMENT_BUCKET',
        message: 'Serverless artifacts bucket',
        default: 'lunde-serverless-deploys',
        filter: trim,
        validate: function(input, a) {
          const done = this.async()
          if (!input) done(null, true)

          doesBucketExist(a.PROFILE, input).then(exists => {
            if (exists === true) done(null, true)
            else {
              console.log('')
              error(
                'This deployment bucket does not exist. You must create this bucket before continuing.'
              )
              process.exit(0)
            }
          })
        },
      },
      {
        name: 'USE_APEX_REDIRECT',
        message: 'Include apex redirect?',
        type: 'confirm',
        default: true,
        when: a => a.DOMAIN.split('.').length === 2,
      },
      {
        name: 'APOLLO_DOMAIN',
        message: `Apollo API endpoint`,
        filter: trim,
        validate: required,
        default: a => `api.${a.DOMAIN}`,
        when: !!args.apollo,
      }
    )
  }

  return prompts
}

// package.json dependencies
module.exports.dependencies = (variables, args) => {
  // everything is a regular dependency for the sake of shit like Now
  let deps = {
    '@babel/runtime': 'latest',
    '@babel/runtime-corejs3': 'latest',
    '@lunde/build-react-app': 'latest',
    '@lunde/deploy-react-app': 'latest',
    '@lunde/render-react-app': 'latest',
    '@style-hooks/styled': 'latest',
    '@testing-library/jest-dom': 'latest',
    '@testing-library/react': 'latest',
    '@testing-library/react-hooks': 'latest',
    'babel-eslint': 'latest',
    'core-js': 'latest',
    'cross-env': 'latest',
    curls: 'latest',
    eslint: 'latest',
    'eslint-import-resolver-jest': 'latest',
    'eslint-plugin-jest': 'latest',
    'eslint-plugin-react': 'latest',
    'eslint-plugin-react-hooks': 'latest',
    husky: 'latest',
    'identity-obj-proxy': 'latest',
    jest: 'latest',
    'lint-staged': 'latest',
    prettier: 'latest',
    'pretty-quick': 'latest',
    'prop-types': 'latest',
    react: 'latest',
    'react-broker': 'latest',
    'react-dom': 'latest',
    'react-helmet-async': 'latest',
    'react-test-renderer': 'latest',
    rimraf: '^2.6.3',
    'resolve-url': 'latest',
    'react-router-dom': 'latest',
  }

  if (args.aws) {
    Object.assign(deps, {
      '@lunde/serverless-bundle': 'latest',
      '@lunde/serverless-certificate-manager': 'latest',
      '@lunde/serverless-dotenv': 'latest',
      'serverless-apigw-binary': '^0.4.4',
      'serverless-domain-manager': '^2.6.13',
      'serverless-http': '^2.3.0',
      'serverless-plugin-lambda-warmup': '^1.0.1',
      'serverless-plugin-scripts': '^1.0.2',
      'serverless-pseudo-parameters': '^2.4.0',
      'serverless-webpack': '^5.3.1',
    })

    if (args.static) {
      delete deps['@lunde/serverless-dotenv']
      delete deps['serverless-apigw-binary']
      delete deps['serverless-http']
      delete deps['serverless-plugin-lambda-warmup']
      delete deps['serverless-webpack']
    }
  }

  if (args.apollo) {
    Object.assign(deps, {
      'apollo-boost': 'latest',
      'apollo-link-context': 'latest',
      'apollo-link-logger': 'latest',
      graphql: 'latest',
      'graphql-tag.macro': 'latest',
      'js-cookie': 'latest',
      'node-fetch': 'latest',
      'react-apollo': 'latest',
      'set-cookie-parser': 'latest',
      unfetch: 'latest',
    })
  }

  return sortByKeys(deps)
}

// package.json peer dependencies
module.exports.peerDependencies = {}

module.exports.include = (variables, args) => {
  const include = ['**/shared/**']
  const isServerless = args.aws
  const isApollo = args.apollo
  const isStatic = args.static || args.now || args.github

  if (isServerless === true && !args.static) {
    include.push('**/aws/**')
  }
  if (isApollo) {
    include.push('**/apollo/**')
    if (isServerless) include.push('**/aws+apollo/**')
  }
  if (isStatic) {
    include.push('**/static/**')
    if (isServerless) include.push('**/aws+static/**')
  }
  if (args.now) {
    include.push('**/now/**')
  }

  return include
}

// filter for renaming files
module.exports.rename = (filename, variables, args) =>
  (filename.endsWith('/gitignore')
    ? filename.replace('gitignore', '.gitignore')
    : filename
  )
    .replace(/\/(aws|shared|static|apollo|now)(\+(apollo|static))?\//g, '/')
    .replace('.inst.', '.')

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = (
  packageJson,
  variables /*from prompts() above*/,
  args
) => {
  packageJson.private = true
  packageJson.scripts = {
    analyze: 'ANALYZE=true build-react-app serve production',
    build: 'build-react-app build',
    clean: 'rimraf dist && rimraf .cache-loader && rimraf node_modules/.cache',
    dev: 'build-react-app serve',
    format: 'prettier --write "src/**/*.js"',
    lint: 'eslint src',
    postinstall: 'npm run clean',
    test: 'jest --passWithNoTests',
    validate: 'npm run lint && npm run test -- --coverage',
  }

  if (args.aws) {
    if (!args.static) {
      packageJson.scripts.build = 'build-react-app build --target node'
    }

    packageJson.scripts.up = 'deploy-react-app aws --stage'
    packageJson.scripts.down = 'deploy-react-app aws --down --stage'
    packageJson.scripts.sls = 'npx serverless'
  } else if (args.now) {
    packageJson.scripts.up = 'deploy-react-app now'
    packageJson.scripts.down = 'deploy-react-app now --down'
    packageJson.scripts.now = 'npx now'
  } else if (args.github) {
    packageJson.scripts.up = 'deploy-react-app github'
    packageJson.scripts.down = 'deploy-react-app github --down'
  }

  packageJson.scripts = sortByKeys(packageJson.scripts)

  packageJson.husky = {
    hooks: {
      'pre-commit': 'lint-staged',
    },
  }

  packageJson['lint-staged'] = {
    'src/**/*.js': ['eslint', 'pretty-quick --staged'],
  }

  packageJson.homepage = `https://github.com/jaredLunde/${variables.PKG_NAME}#readme`
  packageJson.repository = {
    type: 'git',
    url: `https://github.com/jaredLunde/${variables.PKG_NAME}.git`,
  }
  packageJson.bugs = {
    url: `https://github.com/jaredLunde/${variables.PKG_NAME}/issues`,
  }
  // this function must return a valid package.json object
  return packageJson
}
