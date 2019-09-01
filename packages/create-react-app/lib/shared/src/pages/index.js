import React from 'react'
import {Route as Route_} from 'react-router-dom'
import lazy from 'react-broker/macro'
import * as urls from '../urls'

// Simple Route wrapper for preloading in broker
const Route = props => {
  const route = <Route_ key={props.path} {...props} />
  if (typeof props.component.load === 'function') route.load = props.component.load
  return route
}
// Loading state when waiting for Broker chunks
const lazyProps = {loading: () => 'Loading...'}
// NOTE: Order here matters
// ---------------------------------------------------------------------------
// The order these routes are defined in is the same order that they show up in
// inside the <Switch> statement in the <Document> of '../index'
export const Home = <Route path={urls.home()} exact component={lazy('./Home', lazyProps)} />
export const NotFound = <Route path='*' exact component={lazy('./404', lazyProps)} />
