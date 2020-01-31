import createRouter from 'react-router-typed'

type RouteMap = {
  home: {
    path: '/'
  }
  blog: {
    path: '/blog'
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
