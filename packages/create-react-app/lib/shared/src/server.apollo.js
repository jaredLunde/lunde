import React from 'react'
import * as Broker from 'react-broker'
import {StaticRouter} from 'react-router-dom'
import {ApolloProvider} from 'react-apollo'
import {createHttpLink} from 'apollo-link-http'
import {getDataFromTree} from '@apollo/react-ssr'
import fetch from 'node-fetch'
import createRenderer, {
  redirect,
  noFavicon,
  withRobots,
  withCookies,
  pipe,
} from '@lunde/render-react-app'
import {
  createApolloClient,
  createRequestHeadersLink,
  createResponseHeadersLink,
  getCsrfHeaders,
} from './apollo'
import App from './index'

export const renderApp = clientStats => async (req, res) => {
  // provided to react-helmet-async
  const helmetContext = {}
  // tracks redirections and status changes in the Router
  const routerContext = {}
  // creates the Apollo client
  const apolloClient = createApolloClient(
    createRequestHeadersLink({
      req,
      assign: async currentHeaders =>
        Object.assign(
          currentHeaders,
          await getCsrfHeaders({
            res,
            fetch,
            uri: process.env.APOLLO_CSRF_URI,
            cookie: currentHeaders.cookie,
          })
        ),
    }),
    createResponseHeadersLink({res}),
    createHttpLink({uri: process.env.APOLLO_URI, credentials: 'include', fetch})
  )
  // preloads the async components from react-broker and waits for Apollo to execute
  // Queries and retrieve responses
  const html = await getDataFromTree(
    <ApolloProvider client={apolloClient}>
      <StaticRouter location={req.url} context={routerContext}>
        <App helmetContext={helmetContext} />
      </StaticRouter>
    </ApolloProvider>
  )
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
  const chunks = Broker.createChunkCache().getChunkScripts(clientStats, {
    preload: true,
  })
  return `
    <!DOCTYPE html>
    <html ${helmet.htmlAttributes}>
    <head>
      <!-- Preloads bundle scripts -->
      ${
        __STAGE__ === 'development' && !__DEV__
          ? chunks.preload.replace(/\.js/g, '.js.br')
          : chunks.preload
      }
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
      <!-- Initial Apollo state -->
      <script>
        window.__APOLLO_STATE__ = ${JSON.stringify(apolloClient.extract()).replace(
          /</g,
          '\\u003c'
        )}
      </script>
    </head>
    <body ${helmet.bodyAttributes}>
      <noscript>
        <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
          Javascript must be enabled in order to view this website
        </div>
      </noscript>
      <div id="⚛️">${html}</div>
      <!-- Bundle scripts -->
      ${
        __STAGE__ === 'development' && !__DEV__
          ? chunks.scripts.replace(/\.js/g, '.js.br')
          : chunks.scripts
      }
    </body>
    </html>
  `
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
