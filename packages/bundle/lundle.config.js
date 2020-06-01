module.exports = {}

module.exports.babel = (config) => {
  console.log('babel config', config)
  return config
}

module.exports.rollup = (config) => {
  return config
}
