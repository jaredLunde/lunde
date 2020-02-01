import {h, cloneElement} from 'preact'
import {Styles} from '@-ui/react'
import {BodyUsingKeyboard} from '@accessible/using-keyboard'
import {Provider as PrerenderProvider} from '@preact/prerender-data-provider'
import {StaticRouter, BrowserRouter, Switch} from './router'
import {DesignSystem} from './components'
import {styles} from './styles'
// Routes are automagically code split
import pages from './pages'

let extractStyles: (app: JSX.Element, styles: Styles) => JSX.Element
interface StaticRouterProps {
  location: string
  context?: Record<string, any>
}
let Router: FC<StaticRouterProps> | typeof BrowserRouter = BrowserRouter

if (__SERVER__) {
  Router = ({context = {}, location, children}) => (
    <StaticRouter context={context} location={location} children={children} />
  )
  const renderer = require('preact-render-to-string').default
  extractStyles = (app, styles) =>
    require('@-ui/react/server').toComponent(renderer(app), styles)
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
          <Switch>{pages}</Switch>
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
