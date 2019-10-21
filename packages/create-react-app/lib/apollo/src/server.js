import React from 'react'
import * as Broker from 'react-broker'
import {StaticRouter} from 'react-router-dom'
import {ApolloProvider} from 'react-apollo'
import {createHttpLink} from 'apollo-link-http'
import {getDataFromTree} from '@apollo/react-ssr'
import fetch from 'node-fetch'
import {
  createRenderer,
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
  const helmetContext = {}
  const routerContext = {}
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
  const html = await getDataFromTree(
    <ApolloProvider client={apolloClient}>
      <StaticRouter location={req.url} context={routerContext}>
        <App helmetContext={helmetContext} />
      </StaticRouter>
    </ApolloProvider>
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
  const chunks = Broker.createChunkCache().getChunkScripts(clientStats, {
    preload: true,
  })

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
      <script>
        window.__APOLLO_STATE__ = ${JSON.stringify(
          apolloClient.extract()
        ).replace(/</g, '\\u003c')}
      </script>
    </head>
    <body ${helmet.bodyAttributes}>
      ${helmet.noscript}
      <div id="⚛">${html}</div>
      ${
        __STAGE__ === 'development' && !__DEV__
          ? chunks.scripts.replace(/\.js/g, '.js.br')
          : chunks.scripts
      }
    </body>
    </html>
  `
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
