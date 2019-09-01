const {
  configureReactClient,
  configureStaticReactServer,
} = require('@lunde/build-react-app')

module.exports =
  process.env.TARGET === 'web'
    ? configureReactClient({
        entry: [path.join(__dirname, 'src/index.js')],
        output: {
          path: path.join(__dirname, 'dist', process.env.STAGE),
        },
      })
    : configureStaticReactServer({
        entry: [path.join(__dirname, 'src/index.js')],
        output: {
          path: path.join(__dirname, 'dist', process.env.STAGE),
        },
      })
