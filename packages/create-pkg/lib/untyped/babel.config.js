module.exports = api => {
  const module = api.env('module')
  const presetEnv = [
    '@lunde/es',
    {
      env: {
        modules: module ? false : 'commonjs',
        targets: module
          ? {
              browsers: '> 2%',
            }
          : {
              node: '8',
            },
      },
      objectAssign: false,
      typescript: false,
    },
  ]

  return {
    presets: [presetEnv],
  }
}
