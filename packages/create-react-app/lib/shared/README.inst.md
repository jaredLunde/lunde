# <:PKG_NAME:>

## Getting started
```shell script
git clone https://github.com/jaredLunde/<:PKG_NAME:>.git
cd <:PKG_NAME:>
yarn install
# Starts a server at localhost:3000
yarn dev -p 3000
```

## Scripts
### analyze
Runs Webpack bundle analyzer on your production build

### build
| Argument | Alias | Type |  Description |
| --- | --- | --- | --- |
| --prod | -p | `boolean` | Builds in the production NODE_ENV. Otherwise defaults to process.env.NODE_ENV or "development". |  
| --target <target> | -t | `string` | Sets a BUILD_ENV environment variable for your build target, either 'static' or 'node'. Defaults to 'static'. |
| --stage | -s  | `string` | The stage to build in your app for if using stages. Defaults to process.env.STAGE. |
| --config | -c  | `string` | The path to a Webpack config. Defaults to `webpack.config.js` |

### clean
### dev
### format
### lint
### postinstall
### test
### validate

## Application
### Entry files
### Pages
### Components
### Theme
### Static assets

## LICENSE
MIT
