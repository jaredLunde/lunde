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
import StaticSiteGeneratorPlugin from '@stellar-apps/static-site-generator-plugin'
import CompressionPlugin from 'compression-webpack-plugin'
import {createBabelLoader, createConfig, merge, isProd} from '@lunde/webpack'

const defaultAbsoluteRuntime = path.dirname(
  require.resolve('@babel/runtime-corejs3/package.json')
)

// Internal dependencies
const createInternalBabelLoader = (defaultPresets, babelOverride = {}) => {
  const {test, presets, plugins, include, exclude, options} = babelOverride

  return createBabelLoader({
    test,
    ...babelMerge({presets: defaultPresets}, {presets, plugins}),
    include,
    exclude: include ? void 0 : exclude || /node_modules|bower_components/,
    options,
  })
}

// External dependencies
const createExternalBabelLoader = (defaultPresets, babelOverride = {}) => {
  const {test, presets, plugins, include, exclude, options} = babelOverride

  return createBabelLoader({
    test,
    ...babelMerge({presets: defaultPresets}, {presets, plugins}),
    include,
    exclude: include ? void 0 : exclude || /@babel(?:\/|\\{1,2})runtime|core-js|warning/,
    options: {
      ...options,
      // considers the file a "module" if import/export statements are present, or else
      // considers it a "script"
      sourceType: 'unambiguous',
      // doesn't generate source maps for perf reasons
      sourceMaps: false,
      // doesn't minify for perf reasons
      compact: false,
    },
  })
}

export const createBabelLoadersForWeb = (target, babelOverride = {}) => {
  const defaultPresets = [
    [
      '@lunde/react-app',
      {
        es: {
          runtime: isProd() && {absoluteRuntime: defaultAbsoluteRuntime},
        },
      },
    ],
  ]

  return [
    createInternalBabelLoader(defaultPresets, babelOverride.internal),
    createExternalBabelLoader(defaultPresets, babelOverride.external),
  ]
}

export const createBabelLoadersForNode = (target, babelOverride = {}) => {
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
      },
    ],
  ]

  return [
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    },
    createInternalBabelLoader(defaultPresets, babelOverride.internal),
    createExternalBabelLoader(defaultPresets, babelOverride.external),
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
        test: /public\/.*\.(?!(jpe?g|png|webm)$)([^.]+$)$/,
        use: [
          {
            loader: 'file',
            options: {
              regExp: /public\/(.*)\.([^.]+)$/,
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
    babelOverride = {},
    publicLoader,
    compressionOptions,
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
          new CompressionPlugin(
            compressionOptions || {
              test: /\.(js|txt|html|json|md|svg|xml|yml)(\?.*)?$/i,
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
        new StatsWriterPlugin({
          stats: analyze
            ? {all: true}
            : {
                all: false,
                publicPath: true,
                chunks: true,
              },
        }),
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

      module: {
        rules: [...publicLoader, ...createBabelLoadersForWeb(babelOverride)],
      },

      plugins: [
        new webpack.LoaderOptionsPlugin({minimize: false, debug: !isProd()}),
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(!isProd()),
          __SERVER__: JSON.stringify(false),
          __CLIENT__: JSON.stringify(true),
          __STAGE__: JSON.stringify(process.env.STAGE),
        }),
      ],
    },
    envConfig,
    config
  )
}

export const configureReactServer = (...configs) => {
  let {target = 'lambda', babelOverride = {}, publicLoader, ...config} = merge(...configs)
  target = !isProd() ? 'node' : target
  publicLoader = createPublicLoader(publicLoader)
  publicLoader = Array.isArray(publicLoader) ? publicLoader : [publicLoader]

  return createConfig(
    {
      name: 'server',
      target,

      module: {
        rules: [
          ...publicLoader,
          ...createBabelLoadersForNode(babelOverride),
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
        filename: 'render.js',
        libraryTarget: 'commonjs2',
      },

      externals: ['js-beautify', 'encoding'],

      plugins: [
        // prevents emitting anything that isn't text, javascript, or json
        new IgnoreEmitPlugin(/\.(?!txt|[tj]sx?|json)\w+$/),
        new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(!isProd()),
          __SERVER__: JSON.stringify(true),
          __CLIENT__: JSON.stringify(false),
          __STAGE__: JSON.stringify(process.env.STAGE),
        }),
      ].filter(Boolean),
    },
    config
  )
}

export const configureStaticReactServer = (...configs) => {
  const {staticSiteOptions = {}, ...config} = configureReactServer(...configs)
  return merge(
    {
      module: {
        rules: [
          {
            test: /robots(\.disallow)?.txt$/,
            use: [
              {
                loader: 'file',
                options: {
                  name: 'robots.txt',
                },
              },
            ],
          },
          {
            test: /\.html/,
            loaders: ['raw'],
          },
        ],
      },

      plugins: [
        isProd() &&
          new StaticSiteGeneratorPlugin({
            crawl: true,
            locals: {
              // Properties here are merged into `locals`
              // passed to the exported render function
            },
            paths: ['/', ...(staticSiteOptions?.paths || [])],
            ...staticSiteOptions,
          }),
        isProd() &&
          new CompressionPlugin({
            test: /\.(txt|html|json|md|xml|yml)(\?.*)?$/i,
            cache: true,
            algorithm: 'gzip',
            threshold: 1024,
            filename: '[path]',
            compressionOptions: {
              level: zlib.Z_BEST_COMPRESSION,
              memLevel: zlib.Z_BEST_COMPRESSION,
            },
          }),
        new webpack.DefinePlugin({
          process: {
            cwd: function() {},
            env: {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV),
              STAGE: JSON.stringify(process.env.STAGE),
            },
          },
          __DEV__: JSON.stringify(!isProd()),
          __SERVER__: JSON.stringify(true),
          __CLIENT__: JSON.stringify(false),
          __STAGE__: JSON.stringify(process.env.STAGE),
        }),
      ].filter(Boolean),
    },
    config
  )
}
