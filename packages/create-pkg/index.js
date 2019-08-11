// const {flag, required, trim, getPkgJson} = require('@inst-pkg/template-utils')
// const os = require('os')
// const path = require('path')


module.exports = {}

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  {ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR}, /*default template variables*/
  packageJson,                              /*contents of the package.json file as a plain object*/
  args,
  inquirer
) => {
  return []
}

// package.json dependencies
module.exports.dependencies = {
}

// package.json dev dependencies
module.exports.devDependencies = {
  "@lunde/babel-preset-es": "latest",
  "jest": "latest",
  "babel-eslint": "latest",
  "cross-env": "latest",
  "eslint": "latest",
  "eslint-plugin-jest": "latest",
  "husky": "latest",
  "lint-staged": "latest",
  "prettier": "latest",
  "pretty-quick": "latest",
  "rimraf": "latest",
  "typescript": "latest"
}

// package.json peer dependencies
module.exports.peerDependencies = {}

module.exports.rename = (filename) => {
  if (filename.endsWith('gitignore') && !filename.endsWith('.gitignore')) {
    return filename.replace('gitignore', '.gitignore')
  }

  return filename
}

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = function editPackageJson (
  {main, ...packageJson},
  variables /*from prompts() above*/
) {
  return {
    "name": packageJson.name,
    "version": packageJson.version,
    "author": packageJson.author,
    "license": packageJson.license,
    "main": 'dist/cjs/index.js',
    "module": 'dist/es/index.js',
    "types": 'types/index.d.ts',
    "files": ["/dist", "/types", "/src"],
    "description": "",
    "keywords": [variables.PKG_NAME.replace('-', ' ')],
    "sideEffects": false,
    ...packageJson,
    "scripts": {
      "build": "npm run build:types && npm run build:cjs && npm run build:es",
      "build:cjs": "babel src -d dist/cjs -x .js,.ts --ignore \"**/*.test.js\",\"**/test.js\",\"**/*.test.ts\",\"**/test.ts\" --delete-dir-on-start",
      "build:es": "cross-env BABEL_ENV=es babel src -d dist/es -x .js,.ts  --ignore \"**/*.test.js\",\"**/test.js\",\"**/*.test.ts\",\"**/test.ts\" --delete-dir-on-start",
      "build:types": "rimraf types && tsc -p tsconfig.json -d --outDir types  && rimraf types/**/*.js",
      "check-types": "tsc --noEmit --isolatedModules -p tsconfig.json",
      "format": "npm run format:cjs && npm run format:es && npm run format:src",
      "format:cjs": "prettier --write \"dist/es/**/*.js\"",
      "format:es": "prettier --write \"dist/es/**/*.js\"",
      "format:src": "prettier --write \"src/**/*.{ts,js}\"",
      "lint": "eslint src --ext .js,.ts",
      "prepublishOnly": "npm run lint && npm run test && npm run build && npm run format",
      "test": "jest",
      "validate": "npm run check-types && npm run lint && npm run test && npm run format:src"
    },
    "jest": {
      "globals": {
        "__DEV__": true
      }
    },
    "husky": {
      "hooks": {
        "pre-commit": "lint-staged && npm run build:types"
      }
    },
    "lint-staged": {
      "src/**/*.{js,ts}": [
        "eslint",
        "pretty-quick --staged"
      ]
    },
    "homepage": `https://github.com/jaredLunde/${variables.PKG_NAME}#readme`,
    "repository": {
      "type": "git",
      "url": `https://github.com/jaredLunde/${variables.PKG_NAME}.git`
    },
    "bugs": {
      "url": `https://github.com/jaredLunde/${variables.PKG_NAME}/issues`
    }
  }
}