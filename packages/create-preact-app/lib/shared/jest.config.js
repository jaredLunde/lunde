const path = require('path')

module.exports = {
  preset: 'jest-preset-preact',
  setupFiles: [
    '<rootDir>/test/setup.js',
    '<rootDir>/test/__mocks__/browserMocks.js',
  ],
  moduleDirectories: [
    'node_modules',
    path.join(__dirname, 'src'),
    path.join(__dirname, 'test'),
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  snapshotResolver: require.resolve('./test/resolve-snapshot.js'),
  collectCoverageFrom: ['**/src/**/*.{ts,tsx}'],
  globals: {
    __DEV__: true,
    __CLIENT__: true,
    __SERVER__: true,
    __webpack_public_path__: '',
  },
}
