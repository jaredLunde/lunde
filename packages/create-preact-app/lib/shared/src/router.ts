import createRouter from 'react-router-typed'

export type RouteTypes = {
  home: {
    path: '/'
    params: null
  }
}

const router = createRouter<RouteTypes>({
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
