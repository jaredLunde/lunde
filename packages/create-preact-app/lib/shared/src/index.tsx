import {h} from 'preact'
import {Provider as PrerenderProvider} from '@preact/prerender-data-provider'
import {BodyUsingKeyboard} from '@accessible/using-keyboard'
import {Router, Switch, Link} from 'wouter'
import {DesignSystem} from './components'
// Routes are automagically code split
import {pages} from './pages'
import type {Styles} from '@dash-ui/styles'

let extractStyles: (app: JSX.Element, styles: Styles) => JSX.Element

if (__SERVER__) {
  const renderer = require('preact-render-to-string').default
  extractStyles = (app, styles) =>
    require('@dash-ui/react/server').toComponent(renderer(app), styles)
}

const App = (props: any) => {
  let useStaticLocation: () => [string, () => void] | undefined

  if (__SERVER__) {
    useStaticLocation = (): [string, () => void] => [
      props.CLI_DATA.preRenderData.url,
      () => {},
    ]
  }

  const app = (
    <PrerenderProvider props={props}>
      <Router hook={useStaticLocation}>
        <DesignSystem>
          <BodyUsingKeyboard />
          <Switch>{pages}</Switch>
        </DesignSystem>
      </Router>
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
