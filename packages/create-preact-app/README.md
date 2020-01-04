# @lunde/create-preact-app

A command line tool for creating Preact apps out of thin air with deployment
strategies for [Now](https://zeit.co).

## 🔧 Usage

```shell script
# Use `npx`
npx @lunde/create-preact-app my-app --now

# Or install it globally
yarn global add @lunde/create-preact-app
create-preact-app my-app
```

#### `create-react-app <name> [--now]`

When none of the optional arguments are defined, an SSR React app and no deployment strategy is created.

| Argument       | Type      | Required | Description                                                                         |
| -------------- | --------- | -------- | ----------------------------------------------------------------------------------- |
| name           | `string`  | `true`   | The name of your app. This is also the name of the directory that will be created.  |
| --now          | `boolean` | `false`  | Creates a static React app with a Now deployment strategy                           |

## LICENSE

MIT
