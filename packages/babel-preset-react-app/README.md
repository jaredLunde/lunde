# @lunde/babel-preset-react-app

Default Babel packages and configs for my React apps

## Installation

`yarn add --dev @lunde/babel-preset-react-app`

## Usage

### `.babelrc`

```json
{
  "presets": [
    [
      "@lunde/react-app",
      {
        "es": {
          "env": {
            "modules": false
          }
        }
      }
    ]
  ]
}
```

## Included packages

- `core-js@3`
- `@babel/runtime-corejs3`

## Included presets

- `@lunde/babel-preset-es`
- `@babel/preset-react`
- `@emotion/babel-preset-css-prop`

## Included plugins

- `babel-plugin-transform-react-remove-prop-types`
- `babel-plugin-transform-react-pure-class-to-function`
- `babel-plugin-polished`

## Options

### `es`

Accepts all options from [@lunde/babel-preset-es](https://github.com/jaredLunde/lunde/tree/master/packages/babel-preset-es)

- Define `"es": false` to turn off `@lunde/babel-preset-es`

### `removePropTypes`

- Define `"removePropTypes": false` to turn off `babel-plugin-transform-react-remove-prop-types`

### `transformPure`

- Define `"transformPure": false` to turn off `babel-plugin-transform-react-pure-class-to-function`

### `emotion`

- Define `"emotion": false` to turn off `@emotion/babel-preset-css-prop`

### `polished`

- Define `"polished": false` to turn off `babel-plugin-polished`
