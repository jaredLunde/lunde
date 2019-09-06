import mergeWebpack from 'webpack-merge';
import webpack from 'webpack';

export * from './plugins';
export const isProd = () => process.env.NODE_ENV === 'production';

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
      cacheCompression: isProd(),
      // only minifies in prod
      compact: isProd(),
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
});

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
};

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
};

export const merge = mergeWebpack.smartStrategy({'module.rules': 'prepend'});
export const createConfig = (...configs) => {
  let {target = 'web', ...config} = merge({}, ...configs);

  const mainFields =
    target === 'web'
      ? // web main fields
        ['browser', 'module', 'jsnext', 'esnext', 'jsnext:main', 'main']
      : // node main fields
        ['module', 'jsnext', 'esnext', 'jsnext:main', 'main'];

  return merge(
    {
      // Defines the output target
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

      // Resolves modules
      resolve: {
        symlinks: false,
        modules: ['node_modules'],
        mainFields,
        descriptionFiles: ['package.json'],
        // Extensions used to resolve modules
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
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
    isProd() ? productionConfig : devConfig,
    config
  );
};
