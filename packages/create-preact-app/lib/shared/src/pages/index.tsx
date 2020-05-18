import {h} from 'preact'
import {Route} from 'wouter'
import codeSplit from 'code-split.macro'
import asyncComponent from 'create-async-component'

export const Home = asyncComponent(codeSplit('./Home', __SERVER__), {
  property: 'Home',
})
export const pages = [<Route key='home' path='/' component={Home} />]
