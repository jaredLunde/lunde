// const {flag, required, trim, getPkgJson} = require('@inst-pkg/template-utils')
// const os = require('os')
// const path = require('path')
const instUtils = require('@lunde/inst-utils')
const reactPkg = require('@lunde/create-react-pkg')

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

module.exports.copy = async function ({PKG_DIR}, args) {
  const exclude = !args.ts ? fn => fn.includes('.typed') : fn => fn.includes('untyped')
  // copies lib from router app
  await instUtils.copy(
    await instUtils.getPkgLib('@lunde/create-react-pkg'),
    PKG_DIR,
    {
      exclude: fn =>
        fn.endsWith('index.tsx') || fn.endsWith('index.js') || exclude(fn)
    }
  )
}

// package.json dependencies
module.exports.dependencies = {}
// package.json dev dependencies
module.exports.devDependencies = reactPkg.devDependencies
// package.json peer dependencies
module.exports.peerDependencies = {}
module.exports.include = reactPkg.include
module.exports.rename = reactPkg.rename

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = function editPackageJson (
  {main, ...packageJson},
  variables, /*from prompts() above*/
  args
) {
  return {
    ...reactPkg.editPackageJson(packageJson, variables, args),
    "keywords": [
      "react",
      "react hook",
      variables.PKG_NAME.replace('-', ' '),
      `${variables.PKG_NAME.replace('-', ' ')} hook`,
    ]
  }
}