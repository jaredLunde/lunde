// import React from 'react'
// import {renderHook} from '@testing-library/react-hooks'
// import {render} from '@testing-library/react'
// import userEvent from '@testing-library/user-event
const hello = world => `hello ${world}`

test('passes', () => {
  expect(hello('world')).toMatchSnapshot()
})
