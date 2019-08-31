import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import * as Broker from 'react-broker'
import createRenderer, {
  redirect,
  noFavicon,
  withRobots,
  withCookies,
  pipe,
} from '@lunde/render-react-app/createRenderer'
import App from './index'

export const renderApp = clientStats =>
  async function render(req, res) {
    // keeps track of lazy chunks used by the current page
    const chunkCache = Broker.createChunkCache()
    // provided to react-helmet-async
    const helmetContext = {}
    // tracks redirections and status changes in the Router
    const routerContext = {}
    // creates the App in React
    const app = (
      <StaticRouter location={req.url} context={routerContext}>
        <App helmetContext={helmetContext} chunkCache={chunkCache} />
      </StaticRouter>
    )
    // preloads all async components and fetcher queries
    const html = await Broker.loadAll(app, ReactDOMServer.renderToString)
    // sets the status from the router context to the response
    if (routerContext.status) {
      res.statusCode = routerContext.status
    }
    // somewhere a `<Redirect>` was rendered
    if (routerContext.url) {
      // redirect(res, routerContext.status || 301, routerContext.url)
      redirect(res, routerContext.url, routerContext.location?.state?.status || 301)
    }
    // renders the Helmet attributes
    const {helmet} = helmetContext
    const chunks = chunkCache.getChunkScripts(clientStats, {preload: true})
    // returns the document
    return `
    <!DOCTYPE html>
    <html ${helmet.htmlAttributes}>
      <head>
        <!-- Preloads bundle scripts -->
        ${chunks.preload}
        <!-- Page Title -->
        ${helmet.title}
        <!-- Helmet meta -->
        ${helmet.meta}
        <!-- Helmet links -->
        ${helmet.link}
        <!-- Helmet styles -->
        ${helmet.style}
        <!-- Helmet scripts -->
        ${helmet.script}
      </head>
      <body ${helmet.bodyAttributes}>
        <noscript>
          <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
            Javascript must be enabled in order to view this website
          </div>
        </noscript>
        <div id="⚛️">${html}</div>
        <!-- Bundle scripts -->
        ${chunks.scripts}
      </body>
    </html>
  `.trim()
  }

// exports the renderer w/ middleware
export default pipe(
  // 404s on favicon requests
  noFavicon,
  // Sets up robots.txt middleware for micro
  withRobots(`User-agent: *\n${process.env.STAGE === 'production' ? 'Allow' : 'Disallow'}: /`),
  // sets up cookies
  withCookies(),
  // render app wrapper
  createRenderer,
  // renders the app
  renderApp
)
