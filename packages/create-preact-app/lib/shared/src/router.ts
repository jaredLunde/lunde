import {createRouter} from 'react-router-typed/dom'

export type RouteTypes = {
  home: {
    path: '/'
    params: null
    state: null
  }
}

const router = createRouter<RouteTypes>({
  home: '/',
})

export const {
  StaticRouter,
  BrowserRouter,
  Navigate,
  Link,
  NavLink,
  Prompt,
  Outlet,
  Route,
  Router,
  Routes,
  useBlocker,
  useHref,
  useLocation,
  useMatch,
  useNavigate,
  useOutlet,
  useParams,
  useRoutes,
  usePrompt,
  useSearchParams,
  useHistory,
  createAsyncRoute,
} = router
