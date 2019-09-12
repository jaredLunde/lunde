# @lunde/create-pkg

This is an [`inst`](https://github.com/jaredLunde/inst-pkg) template for creating 
ES6 packages with or without TypeScript.

## 📦 What's in the \*\*\*\*ing box?

Packages are created with a variety of build tools that make your life easier

### Build tools

| Library    | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| Babel 7    | For compiling ES6 code to ES5                        |
| Jest       | For testing components                                       |
| Prettier   | For formatting code, READMEs, and configs                     |
| ESLint     | For linting the application                                  |
| Yarn       | For deterministic builds and monorepos                       |
| Travis CI  | (Optional) For continuous integration                                   |
| TypeScript | (Optional) For adding type definitions to your package                                |

## 🔧 Usage

```shell script
# Use `npx`
npx @lunde/create-pkg my-pkg

# Or install it globally
yarn global add @lunde/create-pkg
create-pkg my-pkg --ts
```

## Arguments

#### `create-pkg <name> [--ts]`

| Argument | Type | Required | Description |
| --- | --- | --- |
| name | `string` | `true` | The name of the package you're creating. This is also the name of the directory the package will be created in. |
| --ts | `boolean` | `false` | Creates a TypeScript package


## 📜 Package scripts

### `build`

Builds types (if `--ts`), commonjs, and ECMAScript distributions

### `build:cjs`

Builds the commonjs distribution

### `build:es`

Builds the ECMAScript distribution

### `format`

Formats `src` and `dist` directories with prettier as defined by `.prettierrc`

### `lint`

Runs `eslint` on the package source

### `prepublishOnly`

Runs before the package is published. This calls `lint`, `build`, `test`, and `format` scripts

### `test`

Tests the package with `jest` as defined by options in `package.json -> jest`

### `validate`

Runs `check-types` (if `--ts`), `lint`, `test`, and `format` scripts

## 🚨 TypeScript-specific scripts

### `build:types`

Builds the TypeScript type definitions

### `check-types`

Runs a type check on the project using the local `tsconfig.json`

## 🐺 Husky hooks

### `pre-commit`

Runs `lint-staged` and the `build:types` script

## 💨 Lint staged

Used for calling commands on git staged files that match a glob pattern

### `src/**/*.{js,jsx,ts,tsx}`

Calls `eslint` and `pretty-quick --staged` to lint and format the staged files

## LICENSE

MIT