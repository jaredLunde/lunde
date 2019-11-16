import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import * as Broker from 'react-broker'
import styles from '@-ui/react'
import {createStyleTagFromString} from '@-ui/react/server'
import {
  createRenderer,
  redirect,
  noFavicon,
  withRobots,
  withCookies,
  pipe,
} from '@lunde/render-react-app'
import App from './index'

export const renderApp = clientStats => async (req, res) => {
  const chunkCache = Broker.createChunkCache()
  const helmetContext = {}
  const routerContext = {}
  const html = await Broker.loadAll(
    <StaticRouter location={req.url} context={routerContext}>
      <App helmetContext={helmetContext} chunkCache={chunkCache} />
    </StaticRouter>,
    ReactDOMServer.renderToString
  )

  if (routerContext.status) {
    res.statusCode = routerContext.status
  }

  if (routerContext.url) {
    // A <Redirect> was rendered somewhere in the <App>
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

const middleware = pipe(
  noFavicon,
  withRobots(
    `User-agent: *\n${
      process.env.STAGE === 'production' ? 'Allow' : 'Disallow'
    }: /`
  ),
  withCookies()
)

export default ({clientStats}) =>
  middleware(createRenderer(renderApp(clientStats)))
