const {trim} = require('@inst-cli/template-utils')
const {getPackageName, getPackageRepoPages} = require('@lunde/inst-utils')

module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR} /*default template variables*/,
  packageJson /*contents of the package.json file as a plain object*/,
  args,
  inquirer
) => {
  return [
    {
      type: 'string',
      name: 'DESCRIPTION',
      message: 'Description:',
      filter: trim,
    },
  ]
}

// package.json dependencies
module.exports.dependencies = {}

// package.json dev dependencies
module.exports.devDependencies = (variables, args) => {
  let deps = {
    '@lunde/babel-preset-es': 'latest',
    jest: 'latest',
    'babel-eslint': 'latest',
    'cross-env': 'latest',
    eslint: 'latest',
    'eslint-import-resolver-jest': 'latest',
    'eslint-plugin-jest': 'latest',
    husky: 'latest',
    'lint-staged': 'latest',
    prettier: 'latest',
    rimraf: '^2.6.3',
  }

  if (args.ts) {
    delete deps['babel-eslint']
    deps = {
      ...deps,
      '@types/jest': 'latest',
      '@typescript-eslint/eslint-plugin': 'latest',
      '@typescript-eslint/parser': 'latest',
      'ts-jest': 'latest',
      typescript: 'latest',
    }
  }

  return deps
}

// package.json peer dependencies
module.exports.peerDependencies = {}

module.exports.include = (variables, args) => {
  const include = ['**/shared/**']

  if (args.ts) include.push('**/typed/**')
  else include.push('**/untyped/**')

  return include
}

module.exports.rename = (filename, variables, args) =>
  (filename.endsWith('/gitignore')
    ? filename.replace('gitignore', '.gitignore')
    : filename
  )
    .replace(/(\/shared|typed|untyped\/)/, '/')
    .replace('.inst.', '.')

module.exports.getDefaultVariables = async (variables, args, {name}) => {
  const pages = await getPackageRepoPages({name}, args)

  return {
    packageName: getPackageName({name}, args),
    repo: pages.repository.replace('github:', ''),
    pages,
  }
}

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = async function editPackageJson(
  {main, name, description, ...packageJson},
  variables /*from prompts() above*/,
  args
) {
  let pkg = {
    name: variables.packageName,
    version: packageJson.version,
    ...variables.pages,
    author: packageJson.author,
    license: packageJson.license,
    description: variables.DESCRIPTION || '',
    keywords: [variables.PKG_NAME.replace(/-/g, ' ')],
    main: 'dist/cjs/index.js',
    module: 'dist/es/index.js',
    // types: 'types/index.d.ts',
    // files: ['/dist', '/types'],
    files: ['/dist'],
    sideEffects: false,
    scripts: {
      build: 'npm run build:cjs && npm run build:es && npm run build:types',
      'build:cjs':
        'babel src -d dist/cjs -x .ts --ignore "**/*.test.ts","**/test.ts" --delete-dir-on-start',
      'build:es':
        'babel src -d dist/es -x .ts --env-name es --ignore "**/*.test.ts","**/test.ts" --delete-dir-on-start',
      'build:types':
        'tsc -p tsconfig.json -d --outDir dist/es --emitDeclarationOnly && mkdir -p dist/cjs && cp -R dist/es/**.d.ts dist/cjs && rimraf dist/**/*.test.d.ts',
      'check-types': 'tsc --noEmit -p tsconfig.json',
      format:
        'prettier --write "**/*.{ts,js,md,yml,json,babelrc,eslintrc,prettierrc}"',
      lint: 'eslint . --ext .ts',
      prepublishOnly:
        'npm run lint && npm run test && npm run build && npm run format',
      test: 'jest',
      validate:
        'npm run check-types && npm run lint && npm run test -- --coverage',
    },
    husky: {
      hooks: {
        'pre-commit': 'lint-staged && npm run build:types',
      },
    },
    'lint-staged': {
      '**/*.{ts,js}': ['eslint', 'prettier --write'],
      '**/*.{md,yml,json}': ['prettier --write'],
    },
    ...packageJson,
  }

  if (!args.ts) {
    pkg.files = ['/dist']
    delete pkg.types
    delete pkg.scripts['build:types']
    delete pkg.scripts['check-types']
    pkg.scripts.build = 'npm run build:cjs && npm run build:es'
    pkg.scripts['build:cjs'] =
      'babel src -d dist/cjs -x .js --ignore "**/*.test.js","**/test.js" --delete-dir-on-start'
    pkg.scripts['build:es'] =
      'cross-env BABEL_ENV=es babel src -d dist/es -x .js --ignore "**/*.test.js","**/test.js" --delete-dir-on-start'
    pkg.scripts.lint = 'eslint .'
    pkg.scripts.format =
      'prettier --write "**/*.{js,md,yml,json,babelrc,eslintrc,prettierrc}"'
    pkg.scripts.validate = 'npm run lint && npm run test -- --coverage'
    pkg.husky.hooks['pre-commit'] = 'lint-staged'
    pkg['lint-staged'] = {
      '**/*.js': ['eslint', 'prettier --write'],
      '**/*.{md,yml,json,babelrc,eslintrc,prettierrc}': ['prettier --write'],
    }
  }

  return pkg
}
