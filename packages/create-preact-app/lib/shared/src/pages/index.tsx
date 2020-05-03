import {h} from 'preact'
import {configureRoutes, Route} from 'react-router-typed/dom'
import Home from './Home'

declare module 'react-router-typed/dom' {
  interface RouteTypes {
    home: {
      path: '/'
      params: null
      state: null
    }
  }
}

configureRoutes({
  home: '/',
})

// NOTE: order matters here. These are children of a <Switch>
export default [<Route to='home' key='home' element={<Home />} />]
