import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import * as Broker from 'react-broker'
import {createStaticRenderer} from '@lunde/render-react-app'
import App from './index'

const render = clientStats => async locals => {
  const chunkCache = Broker.createChunkCache()
  const helmetContext = {}
  const app = (
    <StaticRouter location={locals.path} context={{}}>
      <App helmetContext={helmetContext} chunkCache={chunkCache} {...locals} />
    </StaticRouter>
  )
  const page = await Broker.loadAll(app, ReactDOMServer.renderToString)
  const {helmet} = helmetContext
  const chunks = chunkCache.getChunkScripts(clientStats, {preload: true})

  return `
    <!DOCTYPE html>
    <html ${helmet.htmlAttributes}>
      <head>
        ${chunks.preload}
        ${helmet.title}
        ${helmet.base}
        ${helmet.meta}
        ${helmet.link}
        ${helmet.style}
        ${helmet.script}
      </head>
      <body ${helmet.bodyAttributes}>
        ${helmet.noscript}
        <div id="⚛️">${page}</div>
        ${chunks.scripts}
      </body>
    </html>
  `.trim()
}
// BUILD_ENV will be 'static' when the 'build' script is running
// and 'server' when the 'dev' script is running
export default process.env.BUILD_ENV === 'server'
  ? ({clientStats}) => req =>
      createStaticRenderer(render(clientStats))({path: req.url})
  : locals =>
      createStaticRenderer(render(require('../public/.cache/stats.json')))(
        locals
      )
