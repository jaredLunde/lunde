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

// creates a middleware pipe for micro
const middleware = pipe(
  // 404s on favicon requests
  noFavicon,
  // Sets up robots.txt middleware for micro
  withRobots(`User-agent: *\n${process.env.STAGE === 'production' ? 'Allow' : 'Disallow'}: /`),
  // sets up cookies
  withCookies()
)

// this is the server renderer that will handle all requests
const serverRenderer = clientStats => middleware(createRenderer(renderApp(clientStats)))
// sets up options for the Serverless lambda function
let clientStats, mainServerless
if (process.env.STAGE && process.env.STAGE !== 'development') {
  clientStats = require(`../dist/${process.env.STAGE}/client/stats.json`)
  mainServerless = require('serverless-http')(serverRenderer(clientStats))
}
// this is the export that Lambda calls as its handler
export const main = (event, context) =>
  event.source === 'serverless-plugin-lambda-warmup' ? void 0 : mainServerless(event, context)
// by default this just exports the renderer
// this will be used by Webpack dev renderers
export default serverRenderer
