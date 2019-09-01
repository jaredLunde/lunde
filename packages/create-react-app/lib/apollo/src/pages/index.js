import React from 'react'
import {Route as Route_} from 'react-router-dom'
import * as urls from '../urls'

// This is here so there's no issues with forgetting to add a `key` property
const Route = props => <Route_ key={props.path} {...props} />
// NOTE: Order here matters
// ---------------------------------------------------------------------------
// The order these routes are defined in is the same order that they show up in
// inside the <Switch> statement in the <Document> of '../index'
export const Home = (
  <Route path={urls.home()} exact component={require('./Home').default} />
)
export const NotFound = <Route path='*' component={require('./404').default} />
