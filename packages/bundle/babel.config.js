module.exports = (api) => {
  api.cache(true)

  try {
    return require('lundle').babelConfig('test')
  } finally {
    const presetEnv = [
      '@lunde/es',
      {
        env: {
          modules: 'commonjs',
          targets: {
            node: 'current',
          },
        },
        devExpression: false,
        typescript: true,
      },
    ]

    return {
      presets: [presetEnv],
      plugins: ['annotate-pure-calls'],
    }
  }
}
