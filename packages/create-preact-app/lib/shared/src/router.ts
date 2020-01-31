import createRouter from 'react-router-typed'

type RouteMap = {
  home: {
    path: '/'
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
