const webpack = require('webpack')

export default {
  webpack(config, env, helpers) {
    config.node = {
      ...config.node,
      fs: 'empty',
    }

    config.plugins = [
      ...config.plugins,
      new webpack.DefinePlugin({
        __SERVER__: JSON.stringify(env.isServer),
        __CLIENT__: JSON.stringify(!env.isServer),
        __DEV__: JSON.stringify(!env.isProd),
      }),
    ]

    let {
      rule: {options: babelConfig},
    } = helpers.getLoadersByName(config, 'babel-loader')[0]

    babelConfig.plugins.push(
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      require.resolve('@babel/plugin-proposal-nullish-coalescing-operator')
    )

    if (env.isProd) {
      babelConfig.plugins.push(
        require.resolve('babel-plugin-closure-elimination')
      )
    }

    return config
  },
}
