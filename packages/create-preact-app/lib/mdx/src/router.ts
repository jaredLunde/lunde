import createRouter from 'react-router-typed/dom'
import {posts} from './pages/Blog'

export type RouteTypes = {
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

const router = createRouter<RouteTypes>({
  home: '/',
  blog: '/blog',
  'blog.post': '/blog/:slug',
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
