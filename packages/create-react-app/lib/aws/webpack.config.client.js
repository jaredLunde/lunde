const path = require('path')
const {configureReactClient} = require('@lunde/build-react-app')

module.exports = configureReactClient({
  entry: [path.join(__dirname, 'src/client.js')],
  output: {
    publicPath:
      process.env.STAGE === 'production'
        ? 'https://s3.amazonaws.com/<:S3_BUCKET:>/'
        : process.env.STAGE === 'staging'
        ? 'https://s3.amazonaws.com/staging-<:S3_BUCKET:>/'
        : '/assets/',
    path: path.join(__dirname, 'public', 'client'),
  },
  analyze: process.env.ANALYZE,
})
