import {h} from 'preact'
import Route from 'preact-async-route'

export default [
  <Route
    path='/'
    key='home'
    getComponent={() => import('./Home').then((module) => module.Home)}
  />,
]
