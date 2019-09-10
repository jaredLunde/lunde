# <:PKG_NAME:>

## Getting started

```shell script
git clone https://github.com/jaredLunde/<:PKG_NAME:>.git
cd <:PKG_NAME:>
yarn install
# Starts a development server at localhost:3000
yarn dev -p 3000
```

## 💻 Development scripts

### dev

Starts your React app in a development server at http://localhost:3000 by default

| Argument | Alias | Type |  Description |
| --- | --- | --- | --- |
| --prod | -p | `boolean` | Serves the app in a `production` environment. Otherwise defaults to `process.env.NODE_ENV` or `"development"`. |  
| --host <host> | -h | `string` | The hostname to run your server on. Defaults to `::` |
| --port <port> | -p | `number` | The port number to run your server on. Defaults to `3000` |
| --assets <assets> | -p | `string` | A path to public assets outside of and not handled by Webpack in your project |
| --stage <stage> | -s  | `string` | The stage to build your app in if utilizing stages. Defaults to `process.env.STAGE` |
| --config <config> | -c  | `string` | The path to a Webpack config. Defaults to `webpack.config.js` |

### build

Bundles your React app with Webpack to the output path `./public`. 
See [webpack.config.js](tree/master/webpack.config.js) and [build-react-app](https://github.com/jaredLunde/lunde/tree/master/packages/build-react-app)
for more information.

| Argument | Alias | Type |  Description |
| --- | --- | --- | --- |
| --prod | -p | `boolean` | Builds in the `production` environment. Otherwise defaults to `process.env.NODE_ENV` or `"development"`. |  
| --target <target> | -t | `string` | Sets a BUILD_ENV environment variable for your build target, either `"static"` or `"node"`. Defaults to `"static"`. |
| --stage <stage> | -s  | `string` | The stage to build your app in if utilizing stages. Defaults to `process.env.STAGE` |
| --config <config> | -c  | `string` | The path to a Webpack config. Defaults to `webpack.config.js` |

### analyze
Runs Webpack bundle analyzer on your production build

## 🚥 QA scripts

### test
Tests your application using `jest` according to the local [`jest.config.js`](tree/master/jest.config.js)

### lint
Runs `eslint` on the `src` directory according to the local [`.eslintrc`](tree/master/.eslintrc)

### validate
Lints and tests your application using the `lint` and `test` scripts above

## 🧹 Maintenance scripts

### clean
Recursively removes any distribution files generated in a build and any caches
created by Webpack. 

### format
Formats all files ending in `.js`, `.md`, and `.yaml` using Prettier, excluding
`node_modules` and `/public`

## 📒 Things to know

### Configuration files

### Entry files

### Pages

### Components

### Theme

### Static assets

## LICENSE
MIT
