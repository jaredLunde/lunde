import path from 'path'
import webpack from 'webpack'
import zlib from 'zlib'
import babelMerge from 'babel-merge'
import TerserPlugin from 'terser-webpack-plugin'
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'
import {StatsWriterPlugin} from 'webpack-stats-plugin'
import IgnoreEmitPlugin from 'ignore-emit-webpack-plugin'
import ImageminPlugin from 'imagemin-webpack'
import imageminMozJpeg from 'imagemin-mozjpeg'
import imageminOptipng from 'imagemin-optipng'
import CompressionPlugin from 'compression-webpack-plugin'
import {
  StaticSitePlugin,
  RimrafPlugin,
  createBabelLoader,
  createConfig,
  merge,
  isProd,
} from '@lunde/webpack'

const defaultAbsoluteRuntime = path.dirname(
  require.resolve('@babel/runtime-corejs3/package.json')
)

// Internal dependencies
const createInternalBabelLoader = (defaultPresets, override = {}) => {
  const {test, presets, plugins, include, exclude, options} = override

  return createBabelLoader({
    test,
    ...babelMerge({presets: defaultPresets}, {presets, plugins}),
    include,
    exclude: include ? void 0 : exclude || /node_modules|bower_components/,
    options,
  })
}

// External dependencies
const createExternalBabelLoader = (defaultPresets, override = {}) => {
  const {test, presets, plugins, include, exclude, options} = override

  return createBabelLoader({
    test,
    ...babelMerge({presets: defaultPresets}, {presets, plugins}),
    include,
    exclude: include
      ? void 0
      : exclude || /@babel(?:\/|\\{1,2})runtime|core-js|warning/,
    options: {
      ...options,
      // considers the file a "module" if import/export statements are present
      // otherwise it's considered a "script"
      sourceType: 'unambiguous',
      // doesn't generate source maps for perf reasons
      sourceMaps: false,
      // doesn't minify for perf reasons
      compact: false,
    },
  })
}

export const createBabelLoadersForWeb = (target, override = {}) => {
  const defaultPresets = [
    [
      '@lunde/react-app',
      {
        es: {
          runtime: isProd() && {absoluteRuntime: defaultAbsoluteRuntime},
        },
        emotion: false,
      },
    ],
  ]

  return [
    createInternalBabelLoader(defaultPresets, override.internal),
    createExternalBabelLoader(defaultPresets, override.external),
  ]
}

export const createBabelLoadersForNode = (target, override = {}) => {
  const defaultPresets = [
    [
      '@lunde/react-app',
      {
        es: {
          env: {
            targets:
              target === 'lambda'
                ? {node: '10', browsers: void 0}
                : {node: 'current', browsers: void 0},
          },
          runtime: isProd() && {absoluteRuntime: defaultAbsoluteRuntime},
        },
        emotion: false,
      },
    ],
  ]

  return [
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    },
    createInternalBabelLoader(defaultPresets, override.internal),
    createExternalBabelLoader(defaultPresets, override.external),
  ]
}

// sets up loader public files in /public/ directories
export const createPublicLoader = publicLoader => {
  if (publicLoader === false) return {}
  return (
    publicLoader ||
    [
      // Loads all files require()'d from /public/ folders
      {
        // Images get special treatment
        test: /static\/.*\.(?!(jpe?g|png|webm)$)([^.]+$)$/,
        use: [
          {
            loader: 'file',
            options: {
              regExp: /static\/(.*)\.([^.]+)$/,
              name: '[1]/[md4:hash:base62:12].[ext]',
            },
          },
        ],
        exclude: /node_modules|bower_components/,
      },
      // Creates responsive images
      {
        test: /\.(jpe?g|png)$/i,
        use: [
          'cache',
          {
            loader: 'responsive-loader',
            options: {
              name: '[folder]/[name]/[width]x[height]/[md4:hash:12].[ext]',
              adapter: require('responsive-loader/sharp'),
            },
          },
        ],
      },
    ].filter(Boolean)
  )
}

export const configureReactClient = (...configs) => {
  let {
    babel = {},
    stats,
    publicLoader,
    compression,
    clean = true,
    analyze = false,
    ...config
  } = merge(...configs)
  let envConfig

  if (!isProd()) {
    envConfig = {
      node: {
        querystring: true,
      },

      output: {
        globalObject: 'this',
        filename: `js/[name].js`,
        chunkFilename: `js/[name].js`,
      },
    }
  } else {
    envConfig = {
      output: {
        filename: `js/[hash].js`,
        chunkFilename: `js/[contenthash].js`,
      },

      plugins: [
        analyze && new BundleAnalyzerPlugin(),
        !analyze &&
          compression !== false &&
          new CompressionPlugin(
            typeof compression === 'object'
              ? compression
              : {
                  test: /\.(js|txt|html|json|md|svg|xml|yml)(\?.*)?$/i,
                  exclude: /\.cache\//,
                  cache: true,
                  algorithm: 'gzip',
                  threshold: 1024,
                  filename: '[path]',
                  compressionOptions: {
                    level: zlib.Z_BEST_COMPRESSION,
                    memLevel: zlib.Z_BEST_COMPRESSION,
                  },
                }
          ),
        // Compresses images
        new ImageminPlugin({
          cache: true,
          bail: false,
          loader: false,
          maxConcurrency: 8,
          imageminOptions: {
            plugins: [
              imageminMozJpeg({quality: 90, progressive: true}),
              imageminOptipng({optimizationLevel: 7}),
            ],
          },
        }),
      ].filter(Boolean),

      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            cache: true,
            parallel: 4,
            terserOptions: {
              compress: {
                passes: 2,
                keep_infinity: true,
                toplevel: true,
                unsafe_Function: true,
                ecma: 5,
              },
            },
          }),
        ],
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
      },
    }
  }

  publicLoader = createPublicLoader(publicLoader)
  publicLoader = Array.isArray(publicLoader) ? publicLoader : [publicLoader]

  return createConfig(
    {
      name: 'client',
      target: 'web',

      output: {
        publicPath: '/static/',
      },

      module: {
        rules: [...publicLoader, ...createBabelLoadersForWeb(babel)],
      },

      plugins: [
        clean &&
          new RimrafPlugin({path: typeof clean === 'string' ? clean : void 0}),
        new StatsWriterPlugin(
          stats || {
            filename: '.cache/stats.json',
            stats: analyze
              ? {all: true}
              : {
                  all: false,
                  publicPath: true,
                  chunks: true,
                  assetsByChunkName: true,
                },
          }
        ),
        new webpack.LoaderOptionsPlugin({minimize: false, debug: !isProd()}),
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(!isProd()),
          __SERVER__: JSON.stringify(false),
          __CLIENT__: JSON.stringify(true),
        }),
      ].filter(Boolean),
    },
    envConfig,
    config
  )
}

export const configureReactServer = (...configs) => {
  let {
    // all builds
    entry,
    clean = true,
    output,
    target = 'lambda',
    babel = {},
    publicLoader,
    // static builds
    staticSite = false,
    compression = false,
    // everything else
    ...config
  } = merge(...configs)
  target = !isProd() ? 'node' : target
  publicLoader = createPublicLoader(publicLoader)
  publicLoader = Array.isArray(publicLoader) ? publicLoader : [publicLoader]

  let nextConfig = createConfig(
    {
      name: 'server',
      target,
      entry,

      module: {
        rules: [
          ...publicLoader,
          ...createBabelLoadersForNode(babel),
          {
            test: /\.html|\.txt|\.tpl/,
            loaders: ['raw'],
          },
        ],
      },

      resolve: {
        alias: {
          'node-fetch$': 'node-fetch/lib/index.js',
        },
      },

      output: {
        publicPath: '/static/',
        filename: 'render.js',
        libraryTarget: 'commonjs2',
        ...output,
      },

      externals: ['encoding'],

      plugins: [
        clean &&
          new RimrafPlugin({path: typeof clean === 'string' ? clean : void 0}),
        // prevents emitting anything that isn't html, text, javascript, or json
        new IgnoreEmitPlugin(/\.(?!html|txt|[tj]sx?|json)\w+$/),
        new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
        new webpack.DefinePlugin({
          process: {
            cwd: function() {},
            env: Object.keys(process.env).reduce(
              (p, key) =>
                Object.assign(p, {[key]: JSON.stringify(process.env[key])}),
              {}
            ),
          },
          __DEV__: JSON.stringify(!isProd()),
          __SERVER__: JSON.stringify(true),
          __CLIENT__: JSON.stringify(false),
        }),
      ].filter(Boolean),
    },
    config
  )

  if (staticSite === true || typeof staticSite === 'object') {
    const {paths = ['/', '/404/'], locals = {}, crawl = true} =
      typeof staticSite === 'object' ? staticSite : {}

    nextConfig = merge(
      nextConfig,
      {
        output: {
          publicPath: '/static/',
          ...output,
          filename: `.cache/render.js`,
        },

        plugins: [
          new StaticSitePlugin({crawl, locals, paths}),
          isProd() &&
            compression !== false &&
            new CompressionPlugin(
              typeof compression === 'object'
                ? compression
                : {
                    test: /\.(txt|html|json|md|xml|yml)(\?.*)?$/i,
                    exclude: /\.cache\//,
                    cache: true,
                    algorithm: 'gzip',
                    threshold: 1024,
                    filename: '[path]',
                    compressionOptions: {
                      level: zlib.Z_BEST_COMPRESSION,
                      memLevel: zlib.Z_BEST_COMPRESSION,
                    },
                  }
            ),
          new webpack.DefinePlugin({
            process: {
              cwd: function() {},
            },
          }),
          new RimrafPlugin({path: '**/.cache', hook: 'done'}),
        ].filter(Boolean),
      },
      config
    )
  }

  return nextConfig
}
