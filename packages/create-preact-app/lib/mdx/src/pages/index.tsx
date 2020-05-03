import {h} from 'preact'
import {configureRoutes, Route} from 'react-router-typed/dom'

declare module 'react-router-typed/dom' {
  interface RouteTypes {
    home: {
      path: '/'
      params: null
      state: null
    }
    blog: {
      path: '/blog'
      params: null
      state: null
    }
    'blog.post': {
      path: '/blog/:slug'
      params: {
        slug: keyof typeof posts
      }
      state: null
    }
  }
}

configureRoutes({
  home: '/',
  blog: '/blog',
  'blog.post': '/blog/:slug',
})

// NOTE: order matters here. These are children of a <Switch>
export default [
  <Route key='blog.post' to='blog.post' element={<Blog />} />,
  <Route key='blog' to='blog' element={<Blog />} />,
  <Route key='home' to='home' element={<Home />} />,
]
