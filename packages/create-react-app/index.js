const os = require('os')
const path = require('path')
const {required, trim, autocompleteIni} = require('@inst-cli/template-utils')

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
    prompts.push(
      {
        name: 'DOMAIN',
        message: `Domain name`,
        filter: trim,
        validate: required,
      },
      {
        name: 'APOLLO_DOMAIN',
        message: `Apollo API endpoint`,
        filter: trim,
        validate: required,
        default: a => `api.${a.DOMAIN}`,
        when: !!args.apollo,
      },
      {
        name: 'S3_BUCKET',
        message: `Public S3 bucket`,
        default: () => `${PKG_NAME}-public`,
        filter: trim,
        validate: required,
        when: !args.static,
      },
      {
        name: 'DEPLOYMENT_BUCKET',
        message: 'Serverless artifacts bucket',
        default: 'lunde-serverless-deploys',
        filter: trim,
      },
      {
        name: 'USE_APEX_REDIRECT',
        message: 'Include apex redirect?',
        type: 'confirm',
        default: true,
        when: a => a.DOMAIN.split('.').length === 2,
      },
      autocompleteIni(inquirer, CREDENTIALS_FILE, {
        name: 'PROFILE',
        message: `AWS profile`,
        default: PKG_NAME,
        filter: trim,
        validate: required,
      })
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
      '@lunde/serverless-certificate-manager': 'latest',
      '@lunde/serverless-bundle': 'latest',
      'serverless-apigw-binary': 'latest',
      'serverless-domain-manager': 'latest',
      'serverless-http': 'latest',
      'serverless-plugin-lambda-warmup': 'latest',
      'serverless-plugin-scripts': 'latest',
      'serverless-pseudo-parameters': 'latest',
    })

    if (args.static) {
      delete deps['serverless-apigw-binary']
      delete deps['serverless-http']
      delete deps['serverless-plugin-lambda-warmup']
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

  return Object.keys(deps)
    .sort()
    .reduce((acc, key) => {
      acc[key] = deps[key]
      return acc
    }, {})
}

// package.json peer dependencies
module.exports.peerDependencies = {}

module.exports.include = (variables, args) => {
  const include = ['**/shared/**']
  const isServerless = args.aws
  const isApollo = args.apollo
  const isStatic = args.static || args.now || args.github

  if (isServerless === true) {
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
    deploy: null,
    format: 'prettier --write "src/**/*.js"',
    lint: 'eslint src',
    postinstall: 'npm run clean',
    serve: 'build-react-app serve',
    teardown: null,
    test: 'jest --passWithNoTests',
    validate: 'npm run lint && npm run test -- --coverage',
  }

  if (args.aws) {
    packageJson.scripts.deploy = 'deploy-react-app aws --stage'
    packageJson.scripts.teardown = 'deploy-react-app aws --teardown --stage'
    packageJson.scripts.sls = 'npx serverless'
  } else if (args.now) {
    packageJson.scripts.deploy = 'deploy-react-app now'
    packageJson.scripts.teardown = 'deploy-react-app now --teardown'
    packageJson.scripts.now = 'npx now'
  } else if (args.github) {
    packageJson.scripts.deploy = 'deploy-react-app github'
    packageJson.scripts.teardown = 'deploy-react-app github --teardown'
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
