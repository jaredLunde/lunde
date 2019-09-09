import React from 'react'
import {Route as Route_} from 'react-router-dom'
import * as urls from '../urls'

const Route = ({path, ...props}) => <Route_ key={path} path={path} {...props} />
// NOTE:
//   The order these routes matters because they render inside
//   a <Switch> statement
export const Home = (
  <Route exact path={urls.home()} component={require('./Home').default} />
)
export const NotFound = (
  <Route exact path='*' component={require('./404').default} />
)
