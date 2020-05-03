module.exports = api => {
  const module = api.env('module')
  const esm = api.env('esm')
  const presetEnv = [
    '@lunde/es',
    {
      env: {
        modules: esm || module ? false : 'commonjs',
        targets: module
          ? {
              browsers: '> 2%',
            }
          : {
              node: esm ? '12' : '10',
            },
      },
      objectAssign: false,
      typescript: false,
    },
  ]

  return {
    presets: ['@babel/preset-react', presetEnv],
    plugins: ['optimize-react', 'annotate-pure-calls'],
  }
}
