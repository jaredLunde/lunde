const {configureReactClient, configureReactServer} = require('@lunde/configure-react-app')

configureReactClient({
  entry: [path.join(__dirname, 'src/index.js')],
  output: {
    path: path.join(__dirname, 'dist', process.env.STAGE),
  },
})
