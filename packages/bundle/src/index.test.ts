const hello = (world: string) => `hello ${world}`

test('passes', () => {
  expect(hello('world')).toMatchSnapshot()
})
