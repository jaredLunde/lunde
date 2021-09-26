// const {trim} = require('@inst-cli/template-utils')
const {getPackageName, getPackageRepoPages} = require('@lunde/inst-utils')

module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = () => {
  return []
}

// package.json dependencies
module.exports.dependencies = {}

// package.json dev dependencies
module.exports.devDependencies = (variables, args) => {
  let deps = {
    '@commitlint/cli': 'latest',
    '@commitlint/config-conventional': 'latest',
    '@semantic-release/changelog': '^6.0.0',
    '@semantic-release/git': '^10.0.0',
    '@swc-node/core': '^1.6.0',
    '@swc-node/jest': '^1.3.2',
    '@testing-library/jest-dom': 'latest',
    '@testing-library/react': 'latest',
    '@testing-library/react-hooks': 'latest',
    '@testing-library/user-event': 'latest',
    'cli-confirm': 'latest',
    'cz-conventional-changelog': 'latest',
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
module.exports.peerDependencies = (variables, args) => ({
  react: '>=16.8',
})

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
    ...packageJson,
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
    unpkg: `dist/umd/${
      args.hook && !variables.PKG_NAME.startsWith('use-') ? 'use-' : ''
    }${variables.PKG_NAME}.js`,
    source: 'src/index.tsx',
    types: 'types/index.d.ts',
    exports: {
      '.': {
        browser: './dist/module/index.js',
        import: './dist/esm/index.mjs',
        require: './dist/main/index.js',
        umd: `./dist/umd/${
          args.hook && !variables.PKG_NAME.startsWith('use-') ? 'use-' : ''
        }${variables.PKG_NAME}.js`,
        source: './src/index.tsx',
        types: './types/index.d.ts',
        default: './dist/main/index.js',
      },
      './package.json': './package.json',
      './': './',
    },
    files: ['/dist', '/src', '/types'],
    sideEffects: false,
    scripts: {
      build: 'lundle build' + (args.hook ? ' --umd-case camel' : ''),
      'check-types': 'lundle check-types',
      dev: 'lundle build -f module,cjs -w',
      format:
        'prettier --write "{,!(node_modules|dist|coverage)/**/}*.{ts,tsx,js,jsx,md,yml,json}"',
      lint: 'eslint . --ext .ts,.tsx',
      test: 'jest',
      validate: 'lundle check-types && pnpm run lint && jest --coverage',
    },
    husky: {
      hooks: {
        'pre-commit': 'lint-staged',
        'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
      },
    },
    'lint-staged': {
      '**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
      '**/*.{md,yml,json}': ['prettier --write'],
    },
    commitlint: {
      extends: ['@commitlint/config-conventional'],
    },
    config: {
      commitizen: {
        path: './node_modules/cz-conventional-changelog',
      },
    },
    eslintConfig: {
      extends: ['lunde'],
    },
    eslintIgnore: [
      'node_modules',
      'coverage',
      'dist',
      '/types',
      'test',
      '*.config.js',
    ],
    jest: {
      transform: {
        '^.+\\.(t|j)sx?$': [
          '@swc-node/jest',
          {
            react: {
              runtime: 'automatic',
              development: false,
              useBuiltins: true,
            },
          },
        ],
      },
      moduleDirectories: ['node_modules', 'src', 'test'],
      testMatch: ['<rootDir>/src/**/?(*.)test.{ts,tsx}'],
      collectCoverageFrom: ['**/src/**/*.{ts,tsx}'],
      setupFilesAfterEnv: ['./test/setup.ts'],
      snapshotResolver: './test/resolve-snapshot.js',
      globals: {
        __DEV__: true,
      },
    },
    release: {
      branches: ['main', 'next', 'alpha'],
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        [
          '@semantic-release/git',
          {
            assets: ['types', 'CHANGELOG.md', 'package.json'],
            message:
              'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
          },
        ],
        '@semantic-release/npm',
        '@semantic-release/github',
      ],
    },
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
    pkg.scripts.validate = 'pnpm run lint && pnpm run test -- --coverage'
    pkg['lint-staged'] = {
      '**/*.{js,jsx}': ['eslint --fix', 'prettier --write'],
      '**/*.{md,yml,json}': ['prettier --write'],
    }
    pkg.jest = {
      ...pkg.jest,
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
