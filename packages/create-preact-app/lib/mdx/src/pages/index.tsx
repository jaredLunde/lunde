import {h} from 'preact'
import {Route} from 'wouter'
import codeSplit from 'code-split.macro'
import asyncComponent from 'create-async-component'

export const Blog = asyncComponent(codeSplit('./Blog', __SERVER__), {
  property: 'Blog',
})
export const Home = asyncComponent(codeSplit('./Home', __SERVER__), {
  property: 'Home',
})

export const pages: JSX.Element[] = [
  <Route key='blog.post' path='/blog/:post' component={Blog} />,
  <Route key='blog' path='/blog' component={Blog} />,
  <Route key='home' path='/' component={Home} />,
]
