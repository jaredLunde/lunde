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
| --host | -h | `string` | The hostname to run your server on. Defaults to `::` |
| --port | -p | `number` | The port number to run your server on. Defaults to `3000` |
| --assets | -p | `string` | A path to public assets outside of and not handled by Webpack in your project |
| --stage | -s  | `string` | The stage to build your app in if utilizing stages. Defaults to `process.env.STAGE` |
| --config | -c  | `string` | The path to a Webpack config. Defaults to `webpack.config.js` |

### build

Bundles your React app with Webpack to the output path `./public`. 
See [webpack.config.js](tree/master/webpack.config.js) and [build-react-app](https://github.com/jaredLunde/lunde/tree/master/packages/build-react-app)
for more information.

| Argument | Alias | Type |  Description |
| --- | --- | --- | --- |
| --prod | -p | `boolean` | Builds in the `production` environment. Otherwise defaults to `process.env.NODE_ENV` or `"development"`. |  
| --target | -t | `string` | Sets a BUILD_ENV environment variable for your build target, either `"static"` or `"node"`. Defaults to `"static"`. |
| --stage | -s  | `string` | The stage to build your app in if utilizing stages. Defaults to `process.env.STAGE` |
| --config | -c  | `string` | The path to a Webpack config. Defaults to `webpack.config.js` |

### analyze
Runs `webpack-bundle-analyzer` on your production build

## 🚥 QA scripts

### test
Tests your application with `jest` according to the local [`jest.config.js`](tree/master/jest.config.js)

### lint
Runs `eslint` on the `src` directory according to the local [`.eslintrc`](tree/master/.eslintrc)

### validate
Lints and tests your application with the `lint` and `test` scripts above

## 🧹 Maintenance scripts

### clean
Recursively removes any distribution files generated in a build and any caches
created by Webpack. 

### format
Formats all files ending in `.js`, `.md`, and `.yml` with Prettier, excluding
`node_modules` and `/public`

## 🌳 Things to know
And places to go

### Routes and pages
This app uses [`react-router-dom`](https://reacttraining.com/react-router/web/guides/quick-start) for routing. 
Routes are configurable in [src/pages/index.js](tree/master/src/pages/index.js)

### Styles and theming
CSS styles are added to components with [`curls`](https://github.com/jaredLunde/curls) and [`style-hooks`](https://style-hooks.jaredlunde.com). 
Its theme is configurable in [src/theme/index.js](tree/master/src/theme/index.js)

### Code splitting
Routes are code split by [`react-broker`](https://github.com/jaredLunde/react-broker) which
is a great tool that also provides component preloading and SSR capability.

### Static assets
This app uses [`file-loader`](https://www.npmjs.com/package/file-loader) and [`responsive-loader`](https://www.npmjs.com/package/responsive-loader) 
to include images, fonts, and other files in your bundle assets. When you import a file from your
[`src/assets`](tree/master/src/pages/index.js) directory it will be loaded with `file-loader` when the
extension doesn't match `(jpe?g|png|webm)` and `responsive-loader` when it does.

### Entry files
| File | Description |
| --- | --- |
| [src/client.js](tree/master/src/client.js) | The entry file for building the app with a `web` target |
| [src/server.js](tree/master/src/server.js) | The entry file for building the app with a `node` target |


### Configuration files
| File | Description |
| --- | --- |
| [webpack.config.js](tree/master/webpack.config.js) | Configures `webpack`. See also [@lunde/build-react-app](https://github.com/jaredLunde/lunde/tree/master/packages/build-react-app). |
| [jest.config.js](tree/master/jest.config.js) | Configures `jest` |
| [.travis.yml](tree/master/.travis.yml) | (Optional) add CI/CD to your app with [Travis CI](https://travis-ci.org) |
| [.prettierrc](tree/master/prettierrc) | Configures `prettier` |
| [.eslintrc](tree/master/eslintrc) | Configures `eslint` |
| [.babelrc](tree/master/babelrc) | Configures `babel` for the test environment only |

## LICENSE
MIT

---

*Created with ⌨️ and 🕒 by [`@lunde/create-react-app`](https://github.com/jaredLunde/lunde/tree/master/packages/create-react-app)*
