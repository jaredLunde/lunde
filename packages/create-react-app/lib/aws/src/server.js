import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import * as Broker from 'react-broker'
import {
  createRenderer,
  redirect,
  noFavicon,
  withRobots,
  withCookies,
  pipe,
} from '@lunde/render-react-app'
import App from '.'

export const renderApp = clientStats =>
  async function render(req, res) {
    const chunkCache = Broker.createChunkCache()
    const helmetContext = {}
    const routerContext = {}
    const app = (
      <StaticRouter location={req.url} context={routerContext}>
        <App helmetContext={helmetContext} chunkCache={chunkCache} />
      </StaticRouter>
    )
    const html = await Broker.loadAll(app, ReactDOMServer.renderToString)

    if (routerContext.status) {
      res.statusCode = routerContext.status
    }

    if (routerContext.url) {
      // somewhere a `<Redirect>` was rendered
      redirect(
        res,
        routerContext.url,
        routerContext.location?.state?.status || 301
      )
    }

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
        <div id="⚛">${html}</div>
        ${chunks.scripts}
      </body>
    </html>
  `.trim()
  }

const middleware = pipe(
  noFavicon,
  withRobots(
    `User-agent: *\n${
      process.env.STAGE === 'production' ? 'Allow' : 'Disallow'
    }: /`
  ),
  withCookies()
)

const serverRenderer = ({clientStats}) =>
  middleware(createRenderer(renderApp(clientStats)))
let clientStats, mainServerless

// 'node': build script is running
// 'server': dev script is running
// 'serverless': up script is running
if (process.env.BUILD_ENV !== 'server') {
  clientStats = require(`../public/client/.cache/stats.json`)
  mainServerless = require('serverless-http')(serverRenderer({clientStats}))
}

export const main = (event, context) =>
  event.source === 'serverless-plugin-lambda-warmup'
    ? void 0
    : mainServerless(event, context)

export default serverRenderer
