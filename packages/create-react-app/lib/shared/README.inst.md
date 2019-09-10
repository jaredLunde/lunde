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
Bundles your React app with Webpack to the output path `./public`. 
See [webpack.config.js](tree/master/webpack.config.js) and [build-react-app](https://github.com/jaredLunde/lunde/tree/master/packages/build-react-app)
for more information.

| Argument | Alias | Type |  Description |
| --- | --- | --- | --- |
| --prod | -p | `boolean` | Builds in the production NODE_ENV. Otherwise defaults to `process.env.NODE_ENV` or `"development"`. |  
| --target <target> | -t | `string` | Sets a BUILD_ENV environment variable for your build target, either `"static"` or `"node"`. Defaults to `"static"`. |
| --stage | -s  | `string` | The stage to build your app in if utilizing stages. Defaults to `process.env.STAGE` |
| --config | -c  | `string` | The path to a Webpack config. Defaults to `webpack.config.js` |

### clean
Recursively removes any distribution files generated in a build and any caches
created by Webpack. 

### dev

### format
Formats all files ending in `.js`, `.md`, and `.yaml` using Prettier, excluding
`node_modules` and `/public`

### lint
Runs `eslint` on the `src` directory according to the local [`.eslintrc`](tree/master/.eslintrc)

### test
Tests your application using `jest` according to the local [`jest.config.js`](tree/master/jest.config.js)

### validate
Lints and tests your application using the `lint` and `test` scripts above

## Application
### Entry files
### Pages
### Components
### Theme
### Static assets

## LICENSE
MIT
