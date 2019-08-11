const path = require('path')

module.exports = {
  // testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: [
    'node_modules',
    path.join(__dirname, 'src'),
    path.join(__dirname, 'test')
  ],
  // moduleNameMapper: {},
  setupFilesAfterEnv: [require.resolve('./test/setup.js')],
  snapshotResolver: require.resolve('./test/resolve-snapshot.js'),
  globals: {
    __DEV__: true
  }
}