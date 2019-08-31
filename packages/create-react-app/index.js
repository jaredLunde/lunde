const {flag, required, trim} = require('@inst-cli/template-utils')

module.exports = {}
// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, // default template variables
  packageJson, // contents of the package.json file as a plain object
  args, // the arguments passed to the CLI
  inquirer // the inquirer prompt object
) => [
  // See https://github.com/SBoudrias/Inquirer.js#objects
  // for valid prompts
]

// package.json dependencies
module.exports.dependencies = (variables, args) => {
  let deps = {
    '@babel/runtime': 'latest',
    '@babel/runtime-corejs3': 'latest',
    '@lunde/render-react-app': 'latest',
    '@style-hooks/styled': 'latest',
    'core-js': 'latest',
    'curls': 'latest',
    'prop-types': 'latest',
    'react': 'latest',
    'react-broker': 'latest',
    'react-dom': 'latest',
    'react-helmet-async': 'latest',
    "resolve-url": "latest",
    "react-router-dom": "latest",
  }

  if (args.serverless || args.sls) {
    Object.assign(deps, {
      'serverless-http': 'latest'
    })

    if (args.static) {
      delete module.exports.dependencies['serverless-http']
    }
  }

  if (args.apollo) {
    Object.assign(deps, {
      "apollo-boost": "latest",
      "apollo-link-context": "latest",
      "apollo-link-logger": "latest",
      "graphql": "latest",
      "graphql-tag.macro": "latest",
      "js-cookie": "latest",
      "node-fetch": "latest",
      "react-apollo": "latest",
      "set-cookie-parser": "latest",
      "unfetch": "latest"
    })
  }

  return deps
}

// package.json dev dependencies
module.exports.devDependencies = (variables, args) => {
  let deps = {
    '@lunde/configure-react-app': 'latest',
    '@testing-library/jest-dom': 'latest',
    '@testing-library/react': 'latest',
    '@testing-library/react-hooks': 'latest',
    jest: 'latest',
    'babel-eslint': 'latest',
    'cross-env': 'latest',
    eslint: 'latest',
    'eslint-import-resolver-jest': 'latest',
    'eslint-plugin-react': 'latest',
    'eslint-plugin-react-hooks': 'latest',
    'eslint-plugin-jest': 'latest',
    husky: 'latest',
    'lint-staged': 'latest',
    prettier: 'latest',
    'pretty-quick': 'latest',
    'react-test-renderer': 'latest',
    rimraf: 'latest',
  }

  if (args.serverless || args.sls) {
    Object.assign(deps, {
      "@stellar-apps/serverless-sync-bundle": "latest",
      "@stellar-apps/serverless-dotenv": "latest",
      'serverless': 'latest',
      "serverless-apigw-binary": "latest",
      "serverless-domain-manager": "^latest",
      "serverless-plugin-lambda-warmup": "latest",
      "serverless-plugin-scripts": "latest",
      "serverless-pseudo-parameters": "latest",
      "serverless-webpack": "latest",
    })

    if (args.static) {
      delete deps['serverless-webpack']
      delete deps['serverless-apigw-binary']
      delete deps['serverless-plugin-lambda-warmup']
    }
  }

  if (args.static) {
    Object.assign(deps, {
      '@stellar-apps/static-site-generator-plugin': 'latest'
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
  }
  else if (isApollo) {
    include.push('**/apollo/**')
    if (isServerless)
      include.push('**/serverless+apollo/**')
  }
  else if (isStatic) {
    include.push('**/static/**')
    if (isServerless)
      include.push('**/serverless+static/**')
  }

  return include
}

// filter for renaming files
module.exports.rename = (filename, variables, args) =>
  filename.replace(/(\/lib\/)(serverless)?(\+?(apollo|static)\/)?/g, '$1').replace('.inst.', '.')

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
    build: null,
    // deploy: 'stellar-scripts deploy',
    // teardown: 'stellar-scripts teardown',
    clean: 'rimraf .cache-loader && rimraf dist && rimraf node_modules/.cache',
    format: 'prettier --write "src/**/*.js"',
    lint: 'eslint src',
    postinstall: 'npm run clean',
    start: null,
    test: 'jest',
    validate: 'npm run lint && npm run test -- --coverage',
  }

  packageJson.husky = {
    hooks: {
      'pre-commit': 'lint-staged'
    }
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
