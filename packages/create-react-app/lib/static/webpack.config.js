const path = require('path')
const {
  configureReactClient,
  configureReactServer,
} = require('@lunde/build-react-app')
const outputPath = path.join(__dirname, 'public')

module.exports = [
  configureReactClient({
    entry: [path.join(__dirname, 'src/client.js')],
    output: {
      path: path.join(outputPath, 'assets'),
    },
    stats: {
      filename: '../.cache/stats.json', // this is relative to output.path above
      stats: {all: true},
    },
    clean: outputPath,
    compression: false,
    analyze: process.env.ANALYZE,
  }),

  configureReactServer({
    entry: [path.join(__dirname, 'src/server.js')],
    output: {
      path: outputPath,
    },
    staticSite: process.env.NODE_ENV === 'production',
    clean: false,
  }),
]
