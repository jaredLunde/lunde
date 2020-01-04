import {h} from 'preact'
import {Router} from 'preact-router'
import {DashProvider} from '@-ui/react'
import styles from './styles'
import {Header} from './components'
// Routes are automagically code split
import Home from './pages/Home'
import Profile from './pages/Profile'

const App = () => {
  const app = (
    <DashProvider styles={styles}>
      <div id='portals' />
      <Header />
      <Router>
        <Home path='/' />
        <Profile path='/profile/' user='me' />
        <Profile path='/profile/:user' />
      </Router>
    </DashProvider>
  )

  return (
    <div id='app'>
      {app}
      {extractStyles?.(app, styles)}
    </div>
  )
}

let extractStyles

if (__SERVER__) {
  const renderer = require('preact-render-to-string').default
  extractStyles = (app, styles) =>
    require('@-ui/react/server').toComponent(renderer(app), styles)
}

export default App
