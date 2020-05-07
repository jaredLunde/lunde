import {h} from 'preact'
import Route from 'preact-async-route'

const Blog = () => import('./Blog').then((module) => module.default)

export default [
  <Route key='blog.post' path='/blog/:post' getComponent={Blog} />,
  <Route key='blog' path='/blog' getComponent={Blog} />,
  <Route
    key='home'
    path='/'
    getComponent={() => import('./Home').then((module) => module.Home)}
  />,
]
