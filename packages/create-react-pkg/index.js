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
    '@testing-library/jest-dom': 'latest',
    '@testing-library/react': 'latest',
    '@testing-library/react-hooks': 'latest',
    '@testing-library/user-event': 'latest',
    'babel-jest': 'latest',
    jest: 'latest',
    eslint: 'latest',
    'eslint-config-lunde': 'latest',
    husky: 'latest',
    'lint-staged': 'latest',
    lundle: 'latest',
    prettier: 'latest',
    react: 'latest',
    'react-dom': 'latest',
    'react-test-renderer': 'latest',
  }

  if (!args.js) {
    deps = {
      ...deps,
      '@types/jest': 'latest',
      '@types/react': 'latest',
      '@types/react-dom': 'latest',
      typescript: 'latest',
    }
  }

  return deps
}

// package.json peer dependencies
module.exports.peerDependencies = (variables, args) =>
  args.hook
    ? {
        react: '>=16.8',
      }
    : {
        react: '>=16.8',
        'react-dom': '>=16.8',
      }

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
    keywords: [
      'react',
      args.hook ? 'react hook' : 'react component',
      variables.PKG_NAME.replace(/-/g, ' '),
    ],
    main: 'dist/main/index.js',
    module: 'dist/module/index.js',
    unpkg: `dist/umd/${args.hook ? 'use-' : ''}${variables.PKG_NAME}.js`,
    source: 'src/index.tsx',
    types: 'types/index.d.ts',
    files: ['/dist', '/src', '/types'],
    exports: {
      '.': {
        browser: './dist/module/index.js',
        import: './dist/esm/index.mjs',
        require: './dist/main/index.js',
        umd: `./dist/umd/${args.hook ? 'use-' : ''}${variables.PKG_NAME}.js`,
        source: './src/index.tsx',
        types: './types/index.d.ts',
        default: './dist/main/index.js',
      },
      './package.json': './package.json',
      './': './',
    },
    sideEffects: false,
    scripts: {
      build: 'lundle build' + (args.hook ? ' --umd-case camel' : ''),
      'check-types': 'lundle check-types',
      dev: 'lundle build -f module,cjs -w',
      format:
        'prettier --write "{,!(node_modules|dist|coverage)/**/}*.{ts,tsx,js,jsx,md,yml,json}"',
      lint: 'eslint . --ext .ts,.tsx',
      prepublishOnly:
        'npm run lint && npm run test && npm run build && npm run format',
      test: 'jest',
      validate: 'lundle check-types && npm run lint && jest --coverage',
    },
    husky: {
      hooks: {
        'pre-commit': 'lundle check-types && lint-staged',
      },
    },
    'lint-staged': {
      '**/*.{ts,tsx,js,jsx}': ['eslint', 'prettier --write'],
      '**/*.{md,yml,json}': ['prettier --write'],
    },
    eslintConfig: {
      extends: ['lunde'],
    },
    eslintIgnore: ['node_modules', 'coverage', 'dist', 'test', '*.config.js'],
    jest: {
      moduleDirectories: ['node_modules', 'src', 'test'],
      testMatch: ['<rootDir>/src/**/?(*.)test.{ts,tsx}'],
      collectCoverageFrom: ['**/src/**/*.{ts,tsx}'],
      setupFilesAfterEnv: ['./test/setup.js'],
      snapshotResolver: './test/resolve-snapshot.js',
      globals: {
        __DEV__: true,
      },
    },
    prettier: {
      semi: false,
      singleQuote: true,
      jsxSingleQuote: true,
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
    pkg.scripts.lint = 'eslint .'
    pkg.scripts.validate = 'npm run lint && npm run test -- --coverage'
    pkg.husky.hooks['pre-commit'] = 'lint-staged'
    pkg['lint-staged'] = {
      '**/*.{js,jsx}': ['eslint', 'prettier --write'],
      '**/*.{md,yml,json}': ['prettier --write'],
    }
    pkg.jest = {
      moduleDirectories: ['node_modules', 'src', 'test'],
      testMatch: ['<rootDir>/src/**/?(*.)test.{js,jsx}'],
      collectCoverageFrom: ['**/src/**/*.{js,jsx}'],
      setupFilesAfterEnv: ['./test/setup.js'],
      snapshotResolver: './test/resolve-snapshot.js',
      globals: {
        __DEV__: true,
      },
    }
  }

  return pkg
}
