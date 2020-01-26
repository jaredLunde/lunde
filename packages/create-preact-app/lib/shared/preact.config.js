const webpack = require('webpack')
import {resolve} from 'path'

export default {
  webpack(config, env, helpers) {
    // Switch css-loader for typings-for-css-modules-loader, which is a wrapper
    // that automatically generates .d.ts files for loaded CSS
    helpers.getLoadersByName(config, 'css-loader').forEach(({loader}) => {
      loader.loader = 'typings-for-css-modules-loader'
      loader.options = Object.assign(loader.options, {
        camelCase: true,
        namedExport: true,
        silent: true,
      })
    })

    // Use any `index` file, not just index.js
    config.resolve.alias['preact-cli-entrypoint'] = resolve(
      process.cwd(),
      'src',
      'index'
    )

    config.node = {
      ...config.node,
      fs: 'empty',
    }

    config.plugins = [
      ...config.plugins,
      new webpack.DefinePlugin({
        process: {
          cwd: function() {},
          env: Object.keys(process.env).reduce(
            (p, key) =>
              Object.assign(p, {[key]: JSON.stringify(process.env[key])}),
            {}
          ),
        },
        __SERVER__: JSON.stringify(env.isServer),
        __CLIENT__: JSON.stringify(!env.isServer),
        __DEV__: JSON.stringify(!env.isProd),
      }),
    ]

    const {
      rule: {options: babelConfig},
    } = helpers.getLoadersByName(config, 'babel-loader')[0]

    babelConfig.plugins.push(
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      require.resolve('@babel/plugin-proposal-nullish-coalescing-operator')
    )

    return config
  },
}
