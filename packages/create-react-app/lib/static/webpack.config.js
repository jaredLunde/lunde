const path = require('path')
const {configureReactClient, configureReactServer} = require('@lunde/build-react-app')

module.exports = [
  configureReactClient({
    entry: [path.join(__dirname, 'src/client.js')],
    output: {
      path: path.join(__dirname, 'public', 'assets'),
    },
    stats: {
      filename: '../.cache/stats.json', // this is relative to output.path above
      stats: {all: true},
    },
    compression: false,
    analyze: process.env.ANALYZE,
  }),

  configureReactServer({
    entry: [path.join(__dirname, 'src/server.js')],
    output: {
      path: path.join(__dirname, 'public'),
    },
  }),
]
