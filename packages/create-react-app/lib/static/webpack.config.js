const path = require('path')
const {
  configureReactClient,
  configureStaticReactServer,
} = require('@lunde/build-react-app')
const stage = process.env.STAGE || 'development'

module.exports = [
  configureReactClient({
    entry: [path.join(__dirname, 'src/client.js')],
    output: {
      path: path.join(__dirname, 'dist', stage),
    },
    analyze: process.env.ANALYZE,
  }),

  configureStaticReactServer({
    entry: [path.join(__dirname, 'src/server.js')],
    output: {
      path: path.join(__dirname, 'dist', stage),
      filename: 'render.js',
    },
  }),
]
