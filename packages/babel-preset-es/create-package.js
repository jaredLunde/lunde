const createPreset = require('@lunde/create-babel-preset')
const assign = createPreset.assign


const dependencies = {}
dependencies.development = {
  '@babel/cli': {
    version: 'latest',
  },
  '@babel/core': {
    version: 'latest',
  },
  '@babel/preset-env': {
    version: 'latest',
    options: assign(
      {
        loose: true,
        useBuiltIns: false,
        ignoreBrowserslistConfig: true,
        exclude: ['transform-typeof-symbol'],
      },
      'env',
    ),
    isOptional: 'env',
    isBabelPreset: true,
  },
  '@babel/preset-typescript': {
    version: 'latest',
    isOptional: 'typescript',
    isBabelPreset: true
  },
  '@babel/plugin-transform-runtime': {
    version: 'latest',
    options: assign({}, 'runtime'),
    isEnabledByDefault: false,
    isOptional: 'runtime',
    isBabelPlugin: true,
  },
  '@babel/plugin-proposal-class-properties': {
    version: 'latest',
    options: assign({loose: true}, 'classProps'),
    isBabelPlugin: true,
  },
  '@babel/plugin-proposal-export-default-from': {
    version: 'latest',
    isBabelPlugin: true,
  },
  '@babel/plugin-proposal-export-namespace-from': {
    version: 'latest',
    isBabelPlugin: true,
  },
  '@babel/plugin-proposal-logical-assignment-operators': {
    version: 'latest',
    isBabelPlugin: true,
  },
  '@babel/plugin-proposal-nullish-coalescing-operator': {
    version: 'latest',
    isBabelPlugin: true,
  },
  '@babel/plugin-transform-object-assign': {
    version: 'latest',
    isOptional: 'objectAssign',
    isBabelPlugin: true,
  },
  '@babel/plugin-proposal-object-rest-spread': {
    version: 'latest',
    isOptional: 'restSpread',
    isBabelPlugin: true,
  },
  '@babel/plugin-proposal-optional-chaining': {
    version: 'latest',
    isBabelPlugin: true,
  },
  '@babel/plugin-syntax-dynamic-import': {
    version: 'latest',
    isBabelPlugin: true,
  },
  '@babel/plugin-syntax-import-meta': {
    version: 'latest',
    isBabelPlugin: true,
  },
  'babel-plugin-closure-elimination': {
    version: 'latest',
    isOptional: 'closureElimination',
    isBabelPlugin: true,
  },
  'babel-plugin-macros': {
    version: 'latest',
    isOptional: 'macros',
    isBabelPlugin: true,
  },
  'babel-plugin-dev-expression': {
    version: 'latest',
    isOptional: 'devExpression',
    isBabelPlugin: true,
  },
}
dependencies.production = dependencies.development


createPreset.run(dependencies)
