import {h} from 'preact'
import {Route} from 'preact-router'
import codeSplit from 'code-split.macro'
import asyncComponent from 'create-async-component'

const Home = asyncComponent(codeSplit('./Home', __SERVER__), {property: 'Home'})

export default [<Route key='home' path='/' component={Home} />]
