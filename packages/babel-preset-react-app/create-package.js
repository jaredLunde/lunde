const createPreset = require("@lunde/create-babel-preset");
const assign = createPreset.assign;
const deepAssign = createPreset.deepAssign;
const extendProd = createPreset.extendProd;

const dependencies = {};
const envDefaults = {
  useBuiltIns: "usage",
  corejs: 3,
  loose: true,
  modules: false,
  ignoreBrowserslistConfig: true,
  exclude: ["transform-typeof-symbol"]
};

dependencies.development = {
  "core-js": {
    version: "latest"
  },
  "@babel/runtime-corejs3": {
    version: "latest"
  },
  "@babel/preset-react": {
    version: "latest",
    isBabelPreset: true
  },
  "@lunde/babel-preset-es": {
    version: "latest",
    isBabelPreset: true,
    options: deepAssign(
      {
        env: {
          ...envDefaults,
          targets: { browsers: ">2% in US" }
        },
        closureElimination: false,
        devExpression: false,
        runtime: false,
        typescript: false
      },
      "es"
    )
  },
  "@emotion/babel-preset-css-prop": {
    version: "latest",
    isBabelPreset: true,
    options: assign(
      {
        sourceMap: false,
        useBuiltIns: true,
        autoLabel: true
      },
      "emotion"
    ),
    isOptional: "emotion"
  }
};

extendProd(dependencies, {
  "@lunde/babel-preset-es": {
    version: "latest",
    isBabelPreset: true,
    options: deepAssign(
      {
        env: {
          ...envDefaults,
          targets: { browsers: "cover 95% in US, not IE < 12" }
        },
        closureElimination: true,
        devExpression: false,
        runtime: {
          helpers: true,
          useESModules: true
        },
        typescript: false
      },
      "es"
    )
  },
  "babel-plugin-transform-react-remove-prop-types": {
    version: "latest",
    isBabelPlugin: true,
    isOptional: "removePropTypes"
  },
  "babel-plugin-transform-react-pure-class-to-function": {
    version: "latest",
    isBabelPlugin: true,
    isOptional: "transformPure"
  },
  "@emotion/babel-preset-css-prop": {
    version: "latest",
    options: assign(
      {
        sourceMap: false,
        hoist: true,
        useBuiltIns: true,
        autoLabel: false
      },
      "emotion"
    )
  },
  "babel-plugin-polished": {
    version: "latest",
    isBabelPlugin: true,
    isOptional: "polished"
  }
});

createPreset.run(dependencies);
