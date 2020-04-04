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
    '@babel/preset-react': 'latest',
    '@lunde/babel-preset-es': 'latest',
    '@testing-library/jest-dom': 'latest',
    '@testing-library/react': 'latest',
    '@testing-library/react-hooks': 'latest',
    jest: 'latest',
    'babel-eslint': 'latest',
    'babel-plugin-optimize-react': 'latest',
    eslint: 'latest',
    'eslint-import-resolver-jest': 'latest',
    'eslint-plugin-react': 'latest',
    'eslint-plugin-react-hooks': 'latest',
    'eslint-plugin-jest': 'latest',
    husky: 'latest',
    'lint-staged': 'latest',
    prettier: 'latest',
    react: 'latest',
    'react-dom': 'latest',
    'react-test-renderer': 'latest',
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
      'babel-plugin-typescript-to-proptypes': 'latest',
      'ts-jest': 'latest',
      typescript: 'latest',
    }
  }

  return deps
}

// package.json peer dependencies
module.exports.peerDependencies = {
  react: '>=16.8',
  'react-dom': '>=16.8',
  'prop-types': '>=15.6',
}

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
    description: variables.DESCRIPTION || '',
    keywords: [
      'react',
      'react component',
      variables.PKG_NAME.replace(/-/g, ' '),
    ],
    main: 'dist/main/index.js',
    module: 'dist/module/index.js',
    types: 'types/index.d.ts',
    files: ['/dist', '/types'],
    sideEffects: false,
    scripts: {
      build:
        'npm run build-main && npm run build-module && npm run build-types',
      'build-main': 'npm run compile -- -d dist/main --env-name main',
      'build-module': 'npm run compile -- -d dist/module --env-name module',
      'build-types':
        'tsc -p tsconfig.json -d --outDir types --emitDeclarationOnly',
      'check-types': 'tsc --noEmit -p tsconfig.json',
      compile:
        'babel src -x .ts,.tsx --ignore "**/*.test.ts","**/test.ts","**/*.test.tsx","**/test.tsx" --delete-dir-on-start',
      format:
        'prettier --write "**/*.{ts,tsx,js,jsx,md,yml,json,eslintrc,prettierrc}"',
      lint: 'eslint . --ext .ts,.tsx',
      prepublishOnly:
        'npm run lint && npm run test && npm run build && npm run format',
      test: 'jest',
      validate:
        'npm run check-types && npm run lint && npm run test -- --coverage',
    },
    husky: {
      hooks: {
        'pre-commit': 'npm run build-types && git add types && lint-staged',
      },
    },
    'lint-staged': {
      '**/*.{ts,tsx,js,jsx}': ['eslint', 'prettier --write'],
      '**/*.{md,yml,json,eslintrc,prettierrc}': ['prettier --write'],
    },
    ...packageJson,
  }

  if (!args.ts) {
    pkg.files = ['/dist']
    delete pkg.types
    delete pkg.scripts['build-types']
    delete pkg.scripts['check-types']
    pkg.scripts.compile =
      'babel src -x .js,.jsx --ignore "**/*.test.js","**/test.js","**/*.test.jsx","**/test.jsx" --delete-dir-on-start'
    pkg.scripts.build = 'npm run build-main && npm run build-module'
    pkg.scripts.lint = 'eslint .'
    pkg.scripts.format =
      'prettier --write "**/*.{js,jsx,md,yml,json,eslintrc,prettierrc}"'
    pkg.scripts.validate = 'npm run lint && npm run test -- --coverage'
    pkg.husky.hooks['pre-commit'] = 'lint-staged'
    pkg['lint-staged'] = {
      '**/*.{js,jsx}': ['eslint', 'prettier --write'],
      '**/*.{md,yml,json,eslintrc,prettierrc}': ['prettier --write'],
    }
  }

  return pkg
}
