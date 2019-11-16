module.exports = api => {
  let config = {}

  if (api.env('test') === true) {
    config = {
      presets: [
        [
          '@lunde/react-app',
          {
            es: {
              env: {
                targets: {
                  node: 'current',
                },
              },
            },
          },
        ],
      ],
    }
  }

  api.cache(true)
  return config
}
