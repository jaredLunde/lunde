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
      name: 'description',
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
    'babel-jest': 'latest',
    'babel-plugin-annotate-pure-calls': 'latest',
    eslint: 'latest',
    husky: 'latest',
    jest: 'latest',
    'lint-staged': 'latest',
    prettier: 'latest',
  }

  if (!args.js) {
    delete deps['babel-eslint']
    deps = {
      ...deps,
      '@types/jest': 'latest',
      typescript: 'latest',
    }
  }

  return deps
}

// package.json peer dependencies
module.exports.peerDependencies = {}

module.exports.include = (variables, args) => {
  const include = ['**/shared/**']

  if (args.js) include.push('**/untyped/**')
  else include.push('**/typed/**')

  return include
}

module.exports.rename = (filename, variables, args) =>
  (filename.endsWith('/gitignore')
    ? filename.replace('gitignore', '.gitignore')
    : filename
  )
    .replace(/(\/(shared|typed|untyped)\/)/, '/')
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
    description: variables.description || '',
    keywords: [variables.PKG_NAME.replace(/-/g, ' ')],
    main: 'dist/main/index.js',
    module: 'dist/module/index.js',
    source: 'src/index.ts',
    types: 'types/index.d.ts',
    files: ['/dist', '/src', '/types'],
    exports: {
      '.': {
        browser: './dist/module/index.js',
        import: './dist/esm/index.mjs',
        require: './dist/main/index.js',
        source: './src/index.ts',
        types: './types/index.d.ts',
        default: './dist/main/index.js',
      },
      './package.json': './package.json',
      './': './',
    },
    sideEffects: false,
    scripts: {
      build: 'lundle build',
      'check-types': 'lundle check-types',
      dev: 'lundle build -f module,cjs -w',
      format:
        'prettier --write "{,!(node_modules|dist|coverage)/**/}*.{ts,js,md,yml,json}"',
      lint: 'eslint . --ext .ts',
      prepublishOnly:
        'npm run lint && npm run test && npm run build && npm run format',
      test: 'jest',
      validate: 'lundle check-types && npm run lint && jest --coverage',
    },
    husky: {
      hooks: {
        'pre-commit': 'lint-staged',
      },
    },
    'lint-staged': {
      '**/*.{ts,js}': ['lundle build -f types', 'eslint', 'prettier --write'],
      '**/*.{md,yml,json}': ['prettier --write'],
    },
    eslintConfig: {
      extends: ['lunde'],
    },
    eslintIgnore: ['node_modules', 'coverage', 'dist', 'test', '*.config.js'],
    jest: {
      moduleDirectories: ['node_modules', 'src', 'test'],
      testMatch: ['<rootDir>/src/**/?(*.)test.ts'],
      collectCoverageFrom: ['**/src/**/*.ts'],
      setupFilesAfterEnv: ['./test/setup.js'],
      snapshotResolver: './test/resolve-snapshot.js',
      globals: {
        __DEV__: true,
      },
    },
    prettier: {
      semi: false,
      singleQuote: true,
      bracketSpacing: false,
    },
    ...packageJson,
  }

  if (args.js) {
    pkg.files = ['/dist']
    delete pkg.types
    delete pkg.scripts['build-types']
    delete pkg.scripts['check-types']
    delete pkg.exports['.'].types
    pkg.source = 'src/index.js'
    pkg.exports['.'].source = './src/index.js'
    pkg.scripts.build =
      'npm run build-esm && npm run build-main && npm run build-module'
    pkg.scripts.lint = 'eslint .'
    pkg.scripts.validate = 'npm run lint && npm run test -- --coverage'
    pkg['lint-staged'] = {
      '**/*.js': ['eslint', 'prettier --write'],
      '**/*.{md,yml,json,eslintrc,prettierrc}': ['prettier --write'],
    }
    pkg.jest = {
      moduleDirectories: ['node_modules', 'src', 'test'],
      testMatch: ['<rootDir>/src/**/?(*.)test.js'],
      collectCoverageFrom: ['**/src/**/*.js'],
      setupFilesAfterEnv: ['./test/setup.js'],
      snapshotResolver: './test/resolve-snapshot.js',
      globals: {
        __DEV__: true,
      },
    }
  }

  return pkg
}
