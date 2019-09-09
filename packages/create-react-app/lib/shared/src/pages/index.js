import React from 'react'
import {Route} from 'react-router-dom'
import lazy from 'react-broker/macro'
import * as urls from '../urls'

// This <Route> wrapper allows preloading w/ Broker
const route = (path, component, props) => ({
  route: <Route key={path} path={path} component={component} {...props} />,
  load: component.load,
})
const broker = {loading: () => 'Loading...'}
// NOTE:
//   The order these routes matters because they render inside
//   a <Switch> statement
export const Home = route(urls.home(), lazy('./Home', broker), {exact: true})
export const NotFound = route('*', lazy('./404', broker))
