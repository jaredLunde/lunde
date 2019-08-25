import merge from 'webpack-merge'
import babelMerge from 'babel-merge'
import webpack from 'webpack'
import path from 'path'

const defaultAbsoluteRuntime = path.dirname(
  require.resolve('@babel/runtime-corejs3/package.json')
)

const isProd = process.env.NODE_ENV === 'production'

export const createBabelLoader = ({
  test,
  presets,
  plugins,
  include,
  exclude,
  options,
}) => ({
  test: test || /(\.[mtj]sx?)$$/,
  use: {
    loader: 'babel',
    options: {
      presets,
      plugins,
      // only caches compressed files in prod
      cacheCompression: isProd,
      // only minifies in prod
      compact: isProd,
      // caches for better rebuild performance
      cacheDirectory: true,
      // ignores .babelrc in directories
      babelrc: false,
      // ignores config files in directories
      configFile: false,
      ...options,
    },
  },
  include,
  exclude,
})

// Internal dependencies
export const createInternalBabelLoader = (
  defaultPresets,
  babelOverride = {}
) => {
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
export const createExternalBabelLoader = (
  defaultPresets,
  babelOverride = {}
) => {
  const {test, presets, plugins, include, exclude, options} = babelOverride

  return createBabelLoader({
    test,
    ...babelMerge({presets: defaultPresets}, {presets, plugins}),
    include,
    exclude: include
      ? void 0
      : exclude || /@babel(?:\/|\\{1,2})runtime|core-js|warning/,
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

const createBabelLoadersForWeb = (target, babelOverride) => {
  const defaultPresets = [
    [
      '@lunde/react-app',
      {
        es: {
          runtime: isProd && {absoluteRuntime: defaultAbsoluteRuntime},
        },
      },
    ],
  ]

  return [
    createInternalBabelLoader(defaultPresets, babelOverride.internal),
    createExternalBabelLoader(defaultPresets, babelOverride.external),
  ]
}

const createBabelLoadersForNode = (target, babelOverride) => {
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
          runtime: isProd && {absoluteRuntime: defaultAbsoluteRuntime},
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

const getBabelLoaders = (target, babelOverride) =>
  target === 'node' || target === 'lambda'
    ? createBabelLoadersForNode(target, babelOverride)
    : createBabelLoadersForWeb(target, babelOverride)

// sets up loader public files in /public/ directories
const getPublicLoader = publicLoader => {
  if (publicLoader === false) return {}

  const {
    // We expect these image types to be handled specially
    test = /public\/.*\.(?!(jpe?g|png|webm)$)([^.]+$)$/,
    use = [
      {
        loader: 'file',
        options: {
          regExp: /public\/(.*)\.([^.]+)$/,
          name: '[1]/[md4:hash:base62:12].[ext]',
        },
      },
    ],
    include,
    exclude = /node_modules|bower_components/,
  } = publicLoader || {}

  return {test, use, include, exclude: include ? void 0 : exclude}
}

const devConfig = {
  devtool: 'eval',
  mode: 'development',
  performance: {
    hints: false,
  },
  output: {
    pathinfo: false,
  },
  plugins: [new webpack.LoaderOptionsPlugin({minimize: false, debug: true})],
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    moduleIds: 'hashed',
    chunkIds: 'named',
  },
}

const productionConfig = {
  devtool: false,
  mode: 'production',

  plugins: [
    new webpack.HashedModuleIdsPlugin({
      hashFunction: 'md4',
      hashDigest: 'base64',
    }),
  ],

  performance: {
    hints: false,
  },

  optimization: {
    noEmitOnErrors: true,
    moduleIds: 'total-size',
    chunkIds: 'total-size',
  },
}

export const createConfig = (...configs) => {
  let {
    target = 'web',
    babelOverride = {},
    publicLoader,
    ...config
  } = merge.smartStrategy({'module.rules': 'prepend'})(...configs)

  const mainFields =
    target === 'web'
      ? ['browser', 'module', 'jsnext', 'esnext', 'jsnext:main', 'main']
      : ['module', 'jsnext', 'esnext', 'jsnext:main', 'main']

  return merge.smartStrategy({
    'module.rules': 'append',
    'resolve.mainFields': 'replace',
  })(
    isProd ? productionConfig : devConfig,
    {
      target: target === 'lambda' ? 'node' : target,

      // The base directory for resolving the entry option
      output: {
        publicPath: '/public/',
        pathinfo: true,
      },

      // Where to resolve our loaders
      resolveLoader: {
        modules: ['node_modules'],
        moduleExtensions: ['-loader'],
      },

      resolve: {
        // Directories that contain our modules
        symlinks: false,
        modules: ['node_modules'],
        mainFields,
        descriptionFiles: ['package.json'],
        // Extensions used to resolve modules
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
        alias: {
          'node-fetch$': 'node-fetch/lib/index.js',
        },
      },

      module: {
        rules: [
          getPublicLoader(publicLoader),
          ...getBabelLoaders(target, babelOverride),
        ],
      },

      // Include mocks for when node.js specific modules may be required
      node: {
        fs: 'empty',
        vm: 'empty',
        net: 'empty',
        tls: 'empty',
        url: 'empty',
        path: 'empty',
        querystring: 'empty',
        process: true,
      },
    },
    config
  )
}
