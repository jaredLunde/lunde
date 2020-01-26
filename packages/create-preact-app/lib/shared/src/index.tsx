import {h, JSX} from 'preact'
import {Route} from 'react-router-dom'
import {Styles} from '@-ui/react'
import {BodyUsingKeyboard} from '@accessible/using-keyboard'
import {Provider as PrerenderProvider} from '@preact/prerender-data-provider'
import {DesignSystem} from './components'
import {styles} from './styles'
// Routes are automagically code split
import Home from './pages/Home'

let extractStyles: (app: JSX.Element, styles: Styles) => JSX.Element
interface StaticRouterProps {
  location: string
  context?: Record<string, any>
}
let Router: FC<StaticRouterProps>

if (__SERVER__) {
  const StaticRouter = require('react-router-dom').StaticRouter
  Router = ({context = {}, location, children}) => (
    <StaticRouter context={context} location={location} children={children} />
  )
  const renderer = require('preact-render-to-string').default
  extractStyles = (app, styles) =>
    require('@-ui/react/server').toComponent(renderer(app), styles)
} else {
  const createBrowserHistory = require('history').createBrowserHistory
  const BrowserRouter = require('react-router-dom').Router
  const history = createBrowserHistory()
  Router = ({children}) => (
    <BrowserRouter history={history} children={children} />
  )
}

interface FooProps {
  fish: string
}

const App = (props: any) => {
  const app = (
    <PrerenderProvider props={props}>
      <DesignSystem>
        <BodyUsingKeyboard />

        <noscript>
          <div style='font-family: sans-serif; padding: 2rem; text-align: center;'>
            Javascript must be enabled in order to view this website
          </div>
        </noscript>

        <Router location={props.CLI_DATA.preRenderData.url}>
          <Route path='/'>
            <Home />
          </Route>
        </Router>
      </DesignSystem>
    </PrerenderProvider>
  )

  return (
    <div id='app'>
      {app}
      {extractStyles?.(app, styles)}
    </div>
  )
}

export default App
