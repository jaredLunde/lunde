module.exports = {
  babel: (config) => {
    console.log('babel config', config)
    return config
  },
  rollup: (config) => {
    return config
  },
}
