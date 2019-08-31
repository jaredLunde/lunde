import React from 'react'
import ReactDOM from 'react-dom'
import {Router} from 'react-router-dom'
import {createBrowserHistory} from 'history'
import {loadInitial} from 'react-broker'
import App from './index'

const history = createBrowserHistory()
const root = document.getElementById('⚛️')
const hydrate = App => ReactDOM.hydrate(<Router history={history} children={<App />} />, root)
// Hydrates the app after Broker has loaded its chunks
loadInitial().then(() => hydrate(App))

if (__DEV__) {
  module.hot && module.hot.accept('./index', () => hydrate(require('./index').default))
}
