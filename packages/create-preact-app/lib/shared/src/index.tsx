import {h} from 'preact'
import {Styles} from '@dash-ui/react'
import {BodyUsingKeyboard} from '@accessible/using-keyboard'
import {Provider as PrerenderProvider} from '@preact/prerender-data-provider'
import {Router} from 'preact-router'
import {DesignSystem} from './components'
import {styles} from './styles'
// Routes are automagically code split
import pages from './pages'

let extractStyles: (app: JSX.Element, styles: Styles) => JSX.Element
interface StaticRouterProps {
  location: string
  context?: Record<string, any>
}

if (__SERVER__) {
  const renderer = require('preact-render-to-string').default
  extractStyles = (app, styles) =>
    require('@dash-ui/react/server').toComponent(renderer(app), styles)
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

        <Router url={props.CLI_DATA.preRenderData.url}>{pages}</Router>
      </DesignSystem>
    </PrerenderProvider>
  )

  return (
    <div id='app'>
      {extractStyles?.(app, styles)}
      {app}
    </div>
  )
}

export default App
