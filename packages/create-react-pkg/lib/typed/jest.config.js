const path = require('path')

module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  // testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: [
    'node_modules',
    path.join(__dirname, 'src'),
    path.join(__dirname, 'test'),
  ],
  testMatch: ['<rootDir>/src/**/?(*.)test.{ts,tsx}'],
  collectCoverageFrom: ['<rootDir>/src/**/?(*.)test.{ts,tsx}'],
  // moduleNameMapper: {},
  setupFilesAfterEnv: [require.resolve('./test/setup.js')],
  snapshotResolver: require.resolve('./test/resolve-snapshot.js'),
  // coverageThreshold: {
  //   global: {
  //     statements:17,
  //     branches: 4,
  //     lines: 17,
  //     functions: 20
  //   }
  // },
  globals: {
    __DEV__: true,
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    },
  },
}
