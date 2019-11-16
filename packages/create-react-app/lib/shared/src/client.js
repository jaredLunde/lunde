import React from 'react'
import ReactDOM from 'react-dom'
import {Router} from 'react-router-dom'
import {createBrowserHistory} from 'history'
import {loadInitial} from 'react-broker'
import App from './'

const history = createBrowserHistory()
const hydrate = App =>
  ReactDOM.hydrate(
    <Router history={history}>
      <App />
    </Router>,
    document.getElementById('⚛')
  )
// Hydrates the app after Broker has loaded its chunks
loadInitial().then(() => hydrate(App))

if (__DEV__) {
  module.hot &&
    module.hot.accept('./index', () => hydrate(require('./index').default))
}
