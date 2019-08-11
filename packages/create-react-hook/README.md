# @lunde/create-react-hook
This is an [`inst`](https://github.com/jaredLunde/inst-pkg) template for creating React hooks with TypeScript.

## Installation
### Installing `inst`
```bash
npm i -g @inst-pkg/cli
# or `yarn global add @inst-pkg/cli`
```

### Creating a new React hook
```bash
# creates a new React package named [Name] in the [Name] directory
inst add @lunde/create-react-hook [Name]

# validates the new package was successfully created
cd [Name]
npm run validate
```

## Installation options
#### `Name`
The name of the package you're creating

## Package scripts
### `build`
Builds types, commonjs, and ECMAScript distributions

### `build:cjs`
Builds the commonjs distribution

### `build:es`
Builds the ECMAScript distribution

### `build:types`
Builds the TypeScript type definitions

### `check-types`
Runs a type check on the project using the local `tsconfig.json`

### `format`
Formats `src` and `dist` directories with prettier as defined by `.prettierrc`

### `format:cjs`
Formats the commonjs dist with prettier as defined by `.prettierrc`. Weird right? But useful
for debugging.

### `format:es`
Formats the ECMAScript dist with prettier as defined by `.prettierrc`. Weird right? But useful
for debugging.

### `format:src`
Formats the package source with prettier as defined by `.prettierrc`

### `lint`
Runs `eslint` on the package source

### `prepublishOnly`
Runs before the package is published. This calls `lint`, `build`, `test`, and `format` scripts

### `test`
Tests the package with `jest` as defined by options in `package.json -> jest`

### `validate`
Runs `check-types`, `lint`, `test`, and `format:src` scripts

## Husky hooks
### `pre-commit`
Runs `lint-staged` and the `build:types` script

## Lint staged
Used for calling commands on git staged files that match a glob pattern
### `src/**/*.{js,jsx,ts,tsx}`
Calls `eslint` and `pretty-quick --staged` to lint and format the staged files