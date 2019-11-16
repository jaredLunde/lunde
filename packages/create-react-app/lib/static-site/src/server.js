import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import * as Broker from 'react-broker'
import styles from '@-ui/react'
import {createStyleTagFromString} from '@-ui/react/server'
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
  const html = await Broker.loadAll(app, ReactDOMServer.renderToString)
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
        ${createStyleTagFromString(html, styles)}
      </head>
      <body ${helmet.bodyAttributes}>
        ${helmet.noscript}
        <div id="⚛">${html}</div>
        ${chunks.scripts}
      </body>
    </html>
  `.trim()
}
// 'static': build script is running
// 'server': dev script is running
export default process.env.BUILD_ENV === 'server'
  ? ({clientStats}) => req =>
      createStaticRenderer(render(clientStats))({path: req.url})
  : locals =>
      createStaticRenderer(render(require('../public/.cache/stats.json')))(
        locals
      )
