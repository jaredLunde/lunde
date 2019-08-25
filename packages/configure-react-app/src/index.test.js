import {
  configureReactClient,
  configureReactServer,
  configureStaticReactServer,
} from './index'

describe('development', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {...OLD_ENV}
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test('configureReactClient', () => {
    expect(configureReactClient({})).toMatchSnapshot()
  })

  test('configureReactServer', () => {
    expect(configureReactServer({})).toMatchSnapshot()
  })

  test('configureStaticReactServer', () => {
    expect(configureStaticReactServer({})).toMatchSnapshot()
  })
})

describe('production', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {...OLD_ENV}
    process.env.NODE_ENV = 'production'
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test('configureReactClient', () => {
    expect(configureReactClient({})).toMatchSnapshot()
  })

  test('configureReactServer', () => {
    expect(configureReactServer({})).toMatchSnapshot()
  })

  test('configureStaticReactServer', () => {
    expect(configureStaticReactServer({})).toMatchSnapshot()
  })
})
