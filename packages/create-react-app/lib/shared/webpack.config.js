const path = require('path')
const {configureReactClient, configureReactServer} = require('@lunde/build-react-app')
const stage = process.env.STAGE || 'development'

module.exports = [
  configureReactClient({
    entry: [path.join(__dirname, 'src/client.js')],
    output: {
      path: path.join(__dirname, 'dist', stage, 'client'),
    },
    analyze: process.env.ANALYZE,
  }),

  configureReactServer({
    entry: [path.join(__dirname, 'src/server.js')],
    output: {
      path: path.join(__dirname, 'dist', stage, 'server'),
      filename: 'render.js',
    },
  }),
]
