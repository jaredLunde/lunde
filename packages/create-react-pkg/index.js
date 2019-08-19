const {trim} = require('@inst-pkg/template-utils')


module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, /*default template variables*/
  packageJson,                              /*contents of the package.json file as a plain object*/
  args,
  inquirer,
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
    '@babel/preset-react': 'latest',
    '@lunde/babel-preset-es': 'latest',
    '@testing-library/jest-dom': 'latest',
    '@testing-library/react': 'latest',
    '@testing-library/react-hooks': 'latest',
    'jest': 'latest',
    'babel-eslint': 'latest',
    'cross-env': 'latest',
    'eslint': 'latest',
    'eslint-import-resolver-jest': 'latest',
    'eslint-plugin-react': 'latest',
    'eslint-plugin-jest': 'latest',
    'husky': 'latest',
    'lint-staged': 'latest',
    'prettier': 'latest',
    'pretty-quick': 'latest',
    'react': 'latest',
    'react-dom': 'latest',
    'react-test-renderer': 'latest',
    'rimraf': 'latest',
  }

  if (args.ts) {
    delete deps['babel-eslint']
    deps = {
      ...deps,
      '@types/jest': 'latest',
      '@types/react': 'latest',
      '@types/react-dom': 'latest',
      '@typescript-eslint/eslint-plugin': 'latest',
      '@typescript-eslint/parser': 'latest',
      'ts-jest': 'latest',
      'typescript': 'latest',
    }
  }

  return deps
}

// package.json peer dependencies
module.exports.peerDependencies = {}

module.exports.include = (filename, variables, args) =>
  (
    !filename.includes('.typed') && !filename.includes('.untyped')
  )
  || (
    args.ts && filename.includes('.typed')
  )
  || (
    !args.ts && filename.includes('.untyped')
  )

module.exports.rename = (filename, variables, args) => {
  if (filename.endsWith('gitignore') && !filename.endsWith('.gitignore')) {
    return filename.replace('gitignore', '.gitignore')
  }

  return filename.replace('.typed', '').replace('.untyped', '')
}

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = function editPackageJson (
  {main, ...packageJson},
  variables, /*from prompts() above*/
  args
) {
  let pkg = {
    'name': packageJson.name,
    'version': packageJson.version,
    'author': packageJson.author,
    'license': packageJson.license,
    'main': 'dist/cjs/index.js',
    'module': 'dist/es/index.js',
    'types': 'types/index.d.ts',
    'files': ['/dist', '/types'],
    'description': variables.DESCRIPTION || '',
    'keywords': [
      'react',
      'react component',
      variables.PKG_NAME.replace('-', ' '),
    ],
    'sideEffects': false,
    ...packageJson,
    'scripts': {
      'build': 'npm run build:types && npm run build:cjs && npm run build:es',
      'build:cjs': 'babel src -d dist/cjs -x .ts,.tsx --ignore "**/*.test.ts","**/test.ts","**/*.test.tsx","**/test.tsx" --delete-dir-on-start',
      'build:es': 'cross-env BABEL_ENV=es babel src -d dist/es -x .ts,.tsx  --ignore "**/*.test.ts","**/test.ts","**/*.test.tsx","**/test.tsx" --delete-dir-on-start',
      'build:types': 'rimraf types && tsc -p tsconfig.json -d --outDir types',
      'check-types': 'tsc --noEmit -p tsconfig.json',
      'format': 'npm run format:cjs && npm run format:es && npm run format:src',
      'format:cjs': 'prettier --write "dist/cjs/**/*.js"',
      'format:es': 'prettier --write "dist/es/**/*.js"',
      'format:src': 'prettier --parser typescript --write "src/**/*.{ts,tsx}"',
      'lint': 'eslint src --ext .ts,.tsx',
      'prepublishOnly': 'npm run lint && npm run test && npm run build && npm run format',
      'test': 'jest',
      'validate': 'npm run check-types && npm run lint && npm run test -- --coverage',
    },
    'husky': {
      'hooks': {
        'pre-commit': 'lint-staged && npm run build:types',
      },
    },
    'lint-staged': {
      'src/**/*.{ts,tsx}': [
        'eslint',
        'pretty-quick --staged',
      ],
    },
    'homepage': `https://github.com/jaredLunde/${variables.PKG_NAME}#readme`,
    'repository': {
      'type': 'git',
      'url': `https://github.com/jaredLunde/${variables.PKG_NAME}.git`,
    },
    'bugs': {
      'url': `https://github.com/jaredLunde/${variables.PKG_NAME}/issues`,
    },
  }

  if (!args.ts) {
    pkg.files = ['/dist']
    delete pkg.types
    delete pkg.scripts['build:types']
    delete pkg.scripts['check-types']
    pkg.scripts.build = 'npm run build:cjs && npm run build:es'
    pkg.scripts['build:cjs']
      = 'babel src -d dist/cjs -x .js --ignore "**/*.test.js","**/test.js" --delete-dir-on-start'
    pkg.scripts['build:es']
      = 'cross-env BABEL_ENV=es babel src -d dist/es -x .js  --ignore "**/*.test.js","**/test.js" --delete-dir-on-start'
    pkg.scripts.lint = 'eslint src'
    pkg.scripts['format:src'] = 'prettier --write "src/**/*.js"'
    pkg.scripts.validate = 'npm run lint && npm run test -- --coverage'
    pkg.husky.hooks['pre-commit'] = 'lint-staged'
    pkg['lint-staged'] = {
      'src/**/*.js': [
        'eslint',
        'pretty-quick --staged',
      ],
    }
  }

  return pkg
}