let resolver
if (__CLIENT__) resolver = require('resolve-url')
if (__SERVER__) resolver = require('url').resolve
export const resolve = (...uris) => resolver(`/`, ...uris)
// These functions generate predictable, resilient urls
// They should contain trailing slashes if this is a static website
export const home = () => '/'
