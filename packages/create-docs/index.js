const { flag, required, trim } = require("@inst-cli/template-utils");

module.exports = {};

// creates template variables using Inquirer.js
// see https://github.com/SBoudrias/Inquirer.js#objects for prompt object examples
module.exports.prompts = (
  { ROOT_NAME, ROOT_DIR, PKG_NAME, PKG_DIR }, // default template variables
  packageJson, // contents of the package.json file as a plain object
  args, // the arguments passed to the CLI
  inquirer // the inquirer prompt object
) => [
  // See https://github.com/SBoudrias/Inquirer.js#objects
  // for valid prompts
];

// package.json dependencies
module.exports.dependencies = {};

// package.json dev dependencies
module.exports.devDependencies = {};

// package.json peer dependencies
module.exports.peerDependencies = {};

// filter for only including template files that return `true` here
// NOTE: this function is never called if `exclude` is defined
module.exports.include = function include(filename, variables, args) {
  return true;
};

// filter for excluding template files that return true here
// NOTE: this function takes precedence over include() above
// module.exports.exclude = function exclude (filename, variables, args) {
//   return false
// }

// filter for renaming files
module.exports.rename = function rename(filename, variables, args) {
  return filename;
};

// runs after the package.json is created and deps are installed,
// used for adding scripts and whatnot
//
// this function must return a valid package.json object
module.exports.editPackageJson = function editPackageJson(
  packageJson,
  variables /*from prompts() above*/,
  args
) {
  packageJson.scripts = {};

  // this function must return a valid package.json object
  return packageJson;
};
