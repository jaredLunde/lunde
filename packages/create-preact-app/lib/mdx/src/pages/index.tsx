import {h} from 'preact'
import {Route} from 'preact-router'
import codeSplit from 'code-split.macro'
import asyncComponent from 'create-async-component'

const Blog = asyncComponent(codeSplit('./Blog', __SERVER__))
const Home = asyncComponent(codeSplit('./Home', __SERVER__), {property: 'Home'})

export default [
  <Route key='blog.post' path='/blog/:post' component={Blog} />,
  <Route key='blog' path='/blog' component={Blog} />,
  <Route key='home' path='/' component={Home} />,
]
