# @lunde/babel-preset-es
A babel preset for adding TypeScript and ECMAScript features to apps and packages

## Installation
`yarn add --dev @lunde/babel-preset-es`

## Usage
### `.babelrc`
```json
{
  "presets": [
    [
      "@lunde/es", {
        "env": {
          "modules": false
        }
      }
    ]
  ]
}
```
## Included packages
- `@babel/cli`
- `@babel/core`

## Included presets
- `@babel/preset-env`
- `@babel/preset-typescript`

## Included plugins
- `@babel/plugin-transform-runtime`
- `@babel/plugin-proposal-class-properties`
- `@babel/plugin-proposal-export-default-from`
- `@babel/plugin-proposal-export-namespace-from`
- `@babel/plugin-proposal-logical-assignment-operators`
- `@babel/plugin-proposal-nullish-coalescing-operator`
- `@babel/plugin-transform-object-assign`
- `@babel/plugin-proposal-object-rest-spread`
- `@babel/plugin-proposal-optional-chaining`
- `@babel/plugin-syntax-dynamic-import`
- `@babel/plugin-syntax-import-meta`
- `babel-plugin-closure-elimination`
- `babel-plugin-macros`
- `babel-plugin-dev-expression`

## Options
### `env`
Defaults
```json
{
  "loose": true, 
  "useBuiltIns": false, 
  "ignoreBrowserslistConfig": true,
  "exclude": ["transform-typeof-symbol"]
}
```
- Define `"env": false` to turn off `@babel/env`

### `typescript`
- Define `"typescript": false` to turn off `@babel/typescript`


### `runtime`
- *default* `false`
- Define `"runtime": {...}` to turn on `@babel/transform-runtime`

### `classProps`
- *default* `{loose: true}`

### `macros`
- Define `"macros": false` to turn off `@babel/macros`

### `objectAssign`
- Define `"objectAssign": false` to turn off `@babel/transform-object-assign`

### `restSpread`
- Define `"restSpread": false` to turn off `@babel/proposal-rest-spread`

### `closureElimination`
- Define `"closureElimination": false` to turn off `babel-plugin-closure-elimination`

### `devExpression`
- Define `"devExpression": false` to turn off `babel-plugin-dev-expression`
