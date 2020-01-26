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
    '@-ui/grid': 'latest',
    '@-ui/mq': 'latest',
    '@-ui/react': 'latest',
    '@-ui/reset': 'latest',
    '@-ui/spacing': 'latest',
    '@accessible/button': 'latest',
    '@accessible/link': 'latest',
    '@accessible/use-id': 'latest',
    '@accessible/using-keyboard': 'latest',
    '@babel/plugin-proposal-nullish-coalescing-operator': 'latest',
    '@babel/plugin-proposal-optional-chaining': 'latest',
    '@preact/prerender-data-provider': 'latest',
    '@react-hook/window-size': 'latest',
    '@testing-library/jest-dom': 'latest',
    '@testing-library/preact': 'latest',
    '@types/jest': 'latest',
    '@types/react': 'latest',
    '@types/react-router-dom': 'latest',
    '@types/webpack-env': 'latest',
    '@typescript-eslint/eslint-plugin': 'latest',
    '@typescript-eslint/parser': 'latest',
    'babel-eslint': 'latest',
    'babel-plugin-closure-elimination': 'latest',
    clsx: 'latest',
    'code-split.macro': 'latest',
    'create-async-component': 'latest',
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
    pascalcase: 'latest',
    'patch-package': 'latest',
    'postinstall-postinstall': 'latest',
    preact: 'latest',
    'preact-cli': 'rc',
    'preact-render-spy': 'latest',
    'preact-render-to-string': 'latest',
    prettier: 'latest',
    'react-router-dom': 'latest',
    'ts-loader': 'latest',
    typescript: 'latest',
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
        'NODE_ENV=production preact build --preload --no-sw --prerenderUrls prerender-urls.js --no-inline-css',
      dev: 'NODE_ENV=development preact watch -p 3000',
      serve: 'npm run build && npx serve@latest build',
      analyze: 'npm run build -- --analyze',
      'check-types': 'tsc --noEmit',
      lint: 'eslint . --ext .js,.ts,.tsx',
      postinstall: 'patch-package',
      test: 'jest --passWithNoTests',
      format:
        'prettier --write "**/*.{js,jsx,html,md,yml,json,babelrc,eslintrc,prettierrc}"',
      validate: 'npm run lint && npm run test -- --coverage',
    },
    husky: {
      hooks: {
        'pre-commit': 'lint-staged && npm run check-types',
      },
    },
    'lint-staged': {
      '**/*.{js,ts,tsx}': ['eslint', 'prettier --write'],
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
