import {createConfig} from './index'

test('passes', () => {
  expect(createConfig()).toMatchSnapshot()
})
