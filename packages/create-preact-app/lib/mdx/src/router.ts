import createRouter from 'react-router-typed'
import {posts} from './pages/Blog'

export type RouteTypes = {
  home: {
    path: '/'
    params: null
  }
  blog: {
    path: '/blog'
    params: null
  }
  'blog/post': {
    path: '/blog/:slug'
    params: {
      slug: keyof typeof posts
    }
  }
}

const router = createRouter<RouteTypes>({
  home: '/',
  blog: '/blog',
  'blog/post': '/blog/:slug',
})

export const {
  StaticRouter,
  BrowserRouter,
  Switch,
  Redirect,
  Link,
  NavLink,
  useParams,
  useLocation,
  useHistory,
  createAsyncRoute,
} = router
