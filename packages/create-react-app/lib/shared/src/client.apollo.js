import 'unfetch/polyfill/index.js'
import React from 'react'
import ReactDOM from 'react-dom'
import {Router} from 'react-router-dom'
import {loadInitial} from 'react-broker'
import {createBrowserHistory} from 'history'
import {ApolloProvider} from 'react-apollo'
import {createHttpLink} from 'apollo-link-http'
import {createApolloClient, createRequestHeadersLink, getCsrfHeaders} from './apollo'
import App from './index'

const root = document.getElementById('⚛️')
const history = createBrowserHistory()
const httpLink = createHttpLink({
  fetch,
  uri: process.env.APOLLO_URI,
  credentials: 'include',
})
const requestHeadersLink = createRequestHeadersLink({
  assign: async currentHeaders =>
    Object.assign(
      currentHeaders,
      await getCsrfHeaders({
        fetch,
        uri: process.env.APOLLO_CSRF_URI,
        cookie: currentHeaders.cookie,
      })
    ),
})
const apolloClient = createApolloClient(requestHeadersLink, httpLink)
const hydrate = App =>
  ReactDOM.hydrate(
    <ApolloProvider client={apolloClient}>
      <Router history={history}>
        <App />
      </Router>
    </ApolloProvider>,
    root
  )
// Hydrates the app after Broker has loaded its chunks
loadInitial().then(() => hydrate(App))

if (__DEV__) {
  module.hot && module.hot.accept('./index', () => hydrate(require('./index').default))
}
