const path = require('path')
const {configureReactServer} = require('@lunde/build-react-app')

module.exports = configureReactServer({
  entry: [path.join(__dirname, 'src/server.js')],
  output: {
    path: path.join(__dirname, 'public', 'server'),
  },
})
