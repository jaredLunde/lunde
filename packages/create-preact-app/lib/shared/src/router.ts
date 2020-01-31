import createRouter from 'react-router-typed'

export type RouteMap = {
  home: {
    path: '/'
    params: null
  }
}

const router = createRouter<RouteMap>({
  home: '/',
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
