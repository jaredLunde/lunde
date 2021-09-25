const findPkgJson = require('find-package-json')
let hasTypeScript = false

try {
  const pkg = findPkgJson(process.cwd()).next().value
  const allDeps = Object.keys({
    ...pkg.peerDependencies,
    ...pkg.devDependencies,
    ...pkg.dependencies,
  })
  hasTypeScript = allDeps.includes('typescript')
  hasReact = allDeps.includes('react')
  hasJest = allDeps.includes('jest')
} catch (error) {
  // ignore error
}

module.exports = {
  parser: hasTypeScript ? '@typescript-eslint/parser' : 'babel-eslint',
  parserOptions: hasTypeScript
    ? {}
    : {
        sourceType: 'module',
        ecmaVersion: 2018,
        ecmaFeatures: {
          experimentalObjectRestSpread: true,
        },
      },
  plugins: [
    'import',
    'jsdoc',
    hasTypeScript && '@typescript-eslint',
    'sort-export-all',
  ].filter(Boolean),
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:jsdoc/recommended',
    hasTypeScript && 'plugin:@typescript-eslint/recommended',
    hasReact && 'lunde/react',
    hasJest && 'lunde/jest',
  ].filter(Boolean),
  rules: {
    'no-console': 'off',
    'no-prototype-builtins': 'off',
    'no-constant-condition': 'off',
    'no-undef': 'off',
    'no-empty-pattern': 'off',
    // Import rules
    // Credit: Kent C. Dodds
    // https://github.com/kentcdodds/eslint-config-kentcdodds/tree/master/import
    'import/default': 'error',
    'import/export': 'error',
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-cycle': 'warn',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'off',
    'import/extensions': 'error',
    'import/newline-after-import': 'off',
    'import/no-named-as-default': 'error',
    'import/no-amd': 'error',
    'import/no-commonjs': 'off',
    'import/no-named-default': 'error',
    'import/no-namespace': 'off',
    'import/no-nodejs-modules': 'off',
    'import/order': [
      'warn',
      {
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'sort-imports': [
      'warn',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      },
    ],
    'import/first': 'error',
    'import/no-anonymous-default-export': 'off',
    'import/no-absolute-path': 'error',
    'import/no-deprecated': 'warn', // this is an in progress rule
    'import/no-duplicates': 'error',
    'global-require': 'off', // disable because no need to have both!
    'import/no-internal-modules': 'off',
    'import/no-mutable-exports': 'error',
    'import/no-restricted-paths': 'off',
    'import/no-unassigned-import': 'off',
    'import/no-webpack-loader-syntax': 'error',
    'import/no-unused-modules': 'off',
    'import/max-dependencies': 'off',
    'import/dynamic-import-chunkname': 'off',
    'import/exports-last': 'off',
    'import/group-exports': 'off',
    'import/no-dynamic-require': 'off',
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'off',
    'import/no-named-export': 'off',
    'import/unambiguous': 'off', // not sure I understand this rule well enough right now...
    'import/no-relative-parent-imports': 'off',
    'sort-export-all/sort-export-all': 'warn',
    'jsdoc/no-types': 'off',
    'jsdoc/require-param-type': 'off',
    'jsdoc/require-returns': 'off',
    'jsdoc/require-jsdoc': 'off',
    'jsdoc/require-hyphen-before-param-description': 'warn',
    ...(!hasTypeScript
      ? null
      : {
          '@typescript-eslint/member-delimiter-style': 'off',
          '@typescript-eslint/interface-name-prefix': 'off',
          '@typescript-eslint/no-explicit-any': 'off',
          '@typescript-eslint/ban-ts-ignore': 'off',
          '@typescript-eslint/camelcase': 'off',
          '@typescript-eslint/explicit-function-return-type': 'off',
          '@typescript-eslint/no-use-before-define': 'off',
          '@typescript-eslint/no-empty-function': 'off',
          '@typescript-eslint/no-empty-interface': 'off',
          '@typescript-eslint/explicit-module-boundary-types': 'off',
          '@typescript-eslint/ban-ts-comment': 'off',
          '@typescript-eslint/ban-types': 'off',
          '@typescript-eslint/prefer-ts-expect-error': 'warn',
          '@typescript-eslint/consistent-type-imports': [
            'warn',
            {
              prefer: 'type-imports',
            },
          ],
        }),
  },
  settings: {
    'import/ignore': ['node_modules', '.json$', '.(scss|less|css|styl)$'],
    ...(!hasTypeScript
      ? null
      : {
          'import/resolver': {
            typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
          },
        }),
  },
  env: {
    es6: true,
    node: true,
  },
  globals: hasTypeScript
    ? {}
    : {
        __DEV__: true,
      },
}
