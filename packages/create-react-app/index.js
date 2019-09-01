const os = require('os')
const path = require('path')
const {
  flag,
  required,
  trim,
  autocompleteIni,
} = require('@inst-cli/template-utils')

module.exports = {}
const CREDENTIALS_FILE = path.join(os.homedir(), '.aws/credentials')
// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, // default template variables
  args, // the arguments passed to the CLI
  packageJson, // contents of the package.json file as a plain object
  inquirer // the inquirer prompt object
) => {
  const prompts = []

  if (args.serverless || args.sls) {
    prompts.push(
      ...[
        // See https://github.com/SBoudrias/Inquirer.js#objects
        // for valid prompts
        {
          name: 'DOMAIN_PRODUCTION',
          message: `Domain name  [${flag('production', 'green')}] |`,
          filter: trim,
          validate: required,
        },
        {
          name: 'DOMAIN_STAGING',
          message: `Domain name     [${flag('staging', 'white')}] |`,
          default: a =>
            a.DOMAIN_PRODUCTION.split('.').length > 2
              ? `staging--${a.DOMAIN_PRODUCTION}`
              : `staging.${a.DOMAIN_PRODUCTION}`,
          filter: trim,
          validate: required,
        },
        {
          name: 'S3_BUCKET_PRODUCTION',
          message: `S3 bucket    [${flag('production', 'green')}] |`,
          default: a => `${PKG_NAME}-public`,
          filter: trim,
          validate: required,
        },
        {
          name: 'S3_BUCKET_STAGING',
          message: `S3 bucket       [${flag('staging', 'white')}] |`,
          default: a => `staging--${a.S3_BUCKET_PRODUCTION}`,
          filter: trim,
          validate: required,
        },

        autocompleteIni(inquirer, CREDENTIALS_FILE, {
          name: 'AWS_PROFILE',
          message: `AWS profile               |`,
          default: PKG_NAME,
          filter: trim,
          validate: required,
        }),
      ]
    )

    if (args.static) {
      prompts.splice(
        2,
        0,
        ...[
          {
            name: 'SITE_S3_BUCKET_PRODUCTION',
            message: `Website S3 bucket  [${flag('production', 'green')}] |`,
            default: a => a.DOMAIN_PRODUCTION,
            filter: trim,
            validate: required,
          },
          {
            name: 'SITE_S3_BUCKET_STAGING',
            message: `Website S3 bucket     [${flag('staging', 'white')}] |`,
            default: a => a.DOMAIN_STAGING,
            filter: trim,
            validate: required,
          },
        ]
      )
    }
  }

  if (args.apollo) {
    prompts.unshift(
      ...[
        {
          name: 'APOLLO_DOMAIN_PRODUCTION',
          message: `Apollo domain [${flag('production', 'green')}] |`,
          filter: trim,
          validate: required,
        },
        {
          name: 'APOLLO_DOMAIN_STAGING',
          message: `Apollo domain    [${flag('staging', 'white')}] |`,
          filter: trim,
          default: a =>
            a.APOLLO_DOMAIN_PRODUCTION.split('.').length > 2
              ? `staging-${a.APOLLO_DOMAIN_PRODUCTION}`
              : `staging.${a.APOLLO_DOMAIN_PRODUCTION}`,
          validate: required,
        },
      ]
    )
  }

  return prompts
}

// package.json dependencies
module.exports.dependencies = (variables, args) => {
  let deps = {
    '@babel/runtime': 'latest',
    '@babel/runtime-corejs3': 'latest',
    '@lunde/render-react-app': 'latest',
    '@style-hooks/styled': 'latest',
    'core-js': 'latest',
    curls: 'latest',
    'prop-types': 'latest',
    react: 'latest',
    'react-broker': 'latest',
    'react-dom': 'latest',
    'react-helmet-async': 'latest',
    'resolve-url': 'latest',
    'react-router-dom': 'latest',
  }

  if (args.serverless || args.sls) {
    Object.assign(deps, {
      'serverless-http': 'latest',
    })

    if (args.static) {
      delete module.exports.dependencies['serverless-http']
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

  return deps
}

// package.json dev dependencies
module.exports.devDependencies = (variables, args) => {
  let deps = {
    '@lunde/build-react-app': 'latest',
    '@testing-library/jest-dom': 'latest',
    '@testing-library/react': 'latest',
    '@testing-library/react-hooks': 'latest',
    jest: 'latest',
    'babel-eslint': 'latest',
    'cross-env': 'latest',
    eslint: 'latest',
    'eslint-import-resolver-jest': 'latest',
    'eslint-plugin-jest': 'latest',
    'eslint-plugin-react': 'latest',
    'eslint-plugin-react-hooks': 'latest',
    husky: 'latest',
    'identity-obj-proxy': 'latest',
    'lint-staged': 'latest',
    prettier: 'latest',
    'pretty-quick': 'latest',
    'react-test-renderer': 'latest',
    rimraf: '^2.6.3',
  }

  if (args.serverless || args.sls) {
    Object.assign(deps, {
      '@stellar-apps/serverless-sync-bundle': 'latest',
      '@stellar-apps/serverless-dotenv': 'latest',
      serverless: 'latest',
      'serverless-apigw-binary': 'latest',
      'serverless-domain-manager': '^latest',
      'serverless-plugin-lambda-warmup': 'latest',
      'serverless-plugin-scripts': 'latest',
      'serverless-pseudo-parameters': 'latest',
      'serverless-webpack': 'latest',
    })

    if (args.static) {
      delete deps['serverless-webpack']
      delete deps['serverless-apigw-binary']
      delete deps['serverless-plugin-lambda-warmup']
    }
  }

  if (args.static) {
    Object.assign(deps, {
      '@stellar-apps/static-site-generator-plugin': 'latest',
    })
  }

  return deps
}

// package.json peer dependencies
module.exports.peerDependencies = {}

module.exports.include = (variables, args) => {
  const include = ['**/shared/**']
  const isServerless = args.serverless || args.sls
  const isApollo = args.apollo
  const isStatic = args.static

  if (isServerless === true) {
    include.push('**/serverless/**')
  } else if (isApollo) {
    include.push('**/apollo/**')
    if (isServerless) include.push('**/serverless+apollo/**')
  } else if (isStatic) {
    include.push('**/static/**')
    if (isServerless) include.push('**/serverless+static/**')
  }

  return include
}

// filter for renaming files
module.exports.rename = (filename, variables, args) =>
  (filename.endsWith('/gitignore')
    ? filename.replace('gitignore', '.gitignore')
    : filename
  )
    .replace(/\/(serverless|shared|static|apollo)(\+?(apollo|static)\/)?/g, '')
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
  packageJson.scripts = {
    build: 'webpack',
    clean: 'rimraf dist && rimraf .cache-loader && rimraf node_modules/.cache',
    format: 'prettier --write "src/**/*.js"',
    lint: 'eslint src',
    postinstall: 'npm run clean',
    start: '',
    test: 'jest',
    validate: 'npm run lint && npm run test -- --coverage',
  }

  if (args.serverless) {
    packageJson.scripts.deploy = ''
    packageJson.scripts.teardown = ''
  }

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
