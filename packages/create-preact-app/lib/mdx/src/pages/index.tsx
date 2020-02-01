import {h} from 'preact'
import codeSplit from 'code-split.macro'
import {createAsyncRoute} from '../router'

export const Home = createAsyncRoute(codeSplit('./Home', __SERVER__))
export const Blog = createAsyncRoute(codeSplit('./Blog', __SERVER__))
// NOTE: order matters here. These are children of a <Switch>
export default [
  <Blog to='blog.post' key='blog.post' />,
  <Blog to='blog' key='blog' />,
  <Home to='home' key='home' exact />,
]
