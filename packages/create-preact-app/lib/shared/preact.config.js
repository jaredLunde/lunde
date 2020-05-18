import {resolve} from 'path'
import webpack from 'webpack'

export default {
  webpack(config, env, helpers) {
    // Turns off hmr
    if (!env.isProd) {
      config.devServer.hot = false
    }

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
          cwd: function () {},
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
    ].filter(Boolean)

    config.module.rules = [
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack?-svgo,+titleProp,+ref![path]',
          },
        ],
      },
      ...config.module.rules,
    ]

    const {
      rule: {options: babelConfig},
    } = helpers.getLoadersByName(config, 'babel-loader')[0]

    babelConfig.plugins.push(
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
      [
        require.resolve('babel-plugin-dash'),
        {
          instances: {
            styles: {'./src/styles': 'styles'},
            mq: {'./src/styles': 'mq'},
          },
        },
      ]
    )

    if (env.isProd) {
      babelConfig.plugins.push(
        require.resolve('babel-plugin-annotate-pure-calls'),
        require.resolve('babel-plugin-optimize-react')
      )

      if (!env.isServer) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'async',
            cacheGroups: {
              commons: {
                chunks: 'all',
                minChunks: 2,
                reuseExistingChunk: true,
              },
              vendor: {
                test: /node_modules/,
                chunks: 'initial',
                name: 'vendor',
                priority: 10,
                enforce: true,
                reuseExistingChunk: true,
              },
            },
          },
        }
      }
    }

    return config
  },
}
