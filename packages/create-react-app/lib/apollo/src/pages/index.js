import React from 'react'
import {Route} from 'react-router-dom'
import * as urls from '../urls'

// This is here so there's no issues with forgetting to add a `key` property
const route = (path, component, props) => ({
  route: <Route key={path} path={path} component={component} {...props} />,
})
// NOTE: Order here matters
// ---------------------------------------------------------------------------
// The order these routes are defined in is the same order that they show up in
// inside the <Switch> statement in the <Document> of '../index'
export const Home = route(urls.home(), require('./Home').default, {exact: true})
export const NotFound = route('*', require('./404').default)
