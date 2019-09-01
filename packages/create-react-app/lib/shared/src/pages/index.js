import React from 'react'
import {Route} from 'react-router-dom'
import lazy from 'react-broker/macro'
import * as urls from '../urls'

// Simple Route wrapper to allow easy preloading w/ Broker
const route = (path, component, props) => ({
  route: <Route key={path} path={path} component={component} {...props} />,
  load: component.load,
})
// Loading state when waiting for Broker chunks
const broker = {loading: () => 'Loading...'}
// NOTE: Order here matters
// ---------------------------------------------------------------------------
// The order these routes are defined in is the same order that they show up in
// inside the <Switch> statement in the <Document> of '../index'
export const Home = route(urls.home(), lazy('./Home', broker), {exact: true})
export const NotFound = route('*', lazy('./404', broker))
