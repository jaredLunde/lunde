import createRouter from 'react-router-typed'

export type RouteMap = {
  home: {
    path: '/'
    params: null
  }
  blog: {
    path: '/blog'
    params: {
      id: 0
    }
  }
  'blog/post': {
    path: '/blog/:slug'
    params: {
      slug: string
    }
  }
}

const router = createRouter<RouteMap>({
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
