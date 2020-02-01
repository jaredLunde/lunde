import {h} from 'preact'
import codeSplit from 'code-split.macro'
import {createAsyncRoute} from '../router'

export const Home = createAsyncRoute(codeSplit('./Home', __SERVER__))
// NOTE: order matters here. These are children of a <Switch>
export default [<Home to='home' key='home' exact />]
