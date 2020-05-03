import {h} from 'preact'
import {Route} from '../router'
import Home from './Home'

// NOTE: order matters here. These are children of a <Switch>
export default [<Route to='home' key='home' element={<Home />} />]
