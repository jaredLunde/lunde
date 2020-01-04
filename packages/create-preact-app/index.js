const os = require('os')
const path = require('path')
const {required, error, trim} = require('@inst-cli/template-utils')
const {getPackageName, getPackageRepoPages} = require('@lunde/inst-utils')

const sortByKeys = obj =>
  Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})

module.exports = {}
// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object
// examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, // default template variables
  args, // the arguments passed to the CLI
  packageJson, // contents of the package.json file as a plain object
  inquirer // the inquirer prompt object
) => {
  return []
}

// package.json dependencies
module.exports.dependencies = (variables, args) => {
  // everything is a regular dependency for the sake of shit like Now
  let deps = {
    '@-ui/react': 'latest',
    '@-ui/system': 'latest',
    '@babel/plugin-proposal-nullish-coalescing-operator': 'latest',
    '@babel/plugin-proposal-optional-chaining': 'latest',
    'babel-plugin-closure-elimination': 'latest',
    '@testing-library/jest-dom': 'latest',
    '@testing-library/preact': 'latest',
    'babel-eslint': 'latest',
    eslint: 'latest',
    'eslint-import-resolver-jest': 'latest',
    'eslint-plugin-jest': 'latest',
    'eslint-plugin-react': 'latest',
    'eslint-plugin-react-hooks': 'latest',
    husky: 'latest',
    'identity-obj-proxy': 'latest',
    jest: 'latest',
    'jest-preset-preact': 'latest',
    'lint-staged': 'latest',
    'minify-css.macro': 'latest',
    preact: 'latest',
    'preact-cli': '^3.0.0-rc.6',
    'preact-helmet': 'latest',
    'preact-render-spy': 'latest',
    'preact-render-to-string': 'latest',
    'preact-router': 'latest',
    prettier: 'latest',
  }

  return sortByKeys(deps)
}

// package.json peer dependencies
module.exports.peerDependencies = {}

module.exports.include = (variables, args) => {
  const include = ['**/shared/**']
  if (args.now) include.push('**/now/**')
  return include
}

// filter for renaming files
module.exports.rename = (filename, variables, args) =>
  (filename.endsWith('/gitignore')
    ? filename.replace('gitignore', '.gitignore')
    : filename
  )
    .replace(/\/(aws|shared|now)\//g, '/')
    .replace('.inst.', '.')

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = async (
  {main, name, ...packageJson},
  variables /*from prompts() above*/,
  args
) => {
  packageJson = {
    name: getPackageName({name}, args),
    version: packageJson.version,
    private: true,
    browserslist: ['cover 95% in US', 'not IE < 12', 'last 2 versions'],
    scripts: {
      build:
        'NODE_ENV=production preact build --preload --no-sw --prerenderUrls prerender-urls.json --no-inline-css',
      dev: 'NODE_ENV=development preact watch -p 3000',
      serve: 'npm run build && npx serve@latest build',
      analyze: 'npm run build -- --analyze',
      lint: 'eslint .',
      test: 'jest --passWithNoTests',
      format:
        'prettier --write "**/*.{js,jsx,html,md,yml,json,babelrc,eslintrc,prettierrc}"',
      validate: 'npm run lint && npm run test -- --coverage',
    },
    hooks: {
      'pre-commit': 'lint-staged',
    },
    'lint-staged': {
      '**/*.{js,jsx}': ['eslint', 'prettier --write'],
      '**/*.{html,md,yml,json,babelrc,eslintrc,prettierrc}': [
        'prettier --write',
      ],
    },
    ...(await getPackageRepoPages({name}, args)),
    author: packageJson.author,
    license: packageJson.license,
    ...packageJson,
  }

  if (args.now) {
    packageJson.scripts.up = 'npx now@latest'
    packageJson.scripts.down = `npx now@latest rm ${name}`
  }

  packageJson.scripts = sortByKeys(packageJson.scripts)
  return packageJson
}
