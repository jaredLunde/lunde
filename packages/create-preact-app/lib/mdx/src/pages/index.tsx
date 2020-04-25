import {h} from 'preact'
import {Route} from '../router'

// NOTE: order matters here. These are children of a <Switch>
export default [
  <Route key='blog.post' to='blog.post' element={<Blog />} />,
  <Route key='blog' to='blog' element={<Blog />} />,
  <Route key='home' to='home' element={<Home />} />,
]
