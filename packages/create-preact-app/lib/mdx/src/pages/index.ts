import codeSplit from 'code-split.macro'
import {createAsyncRoute} from 'create-async-route'

export const Home = createAsyncRoute(codeSplit('./Home', __SERVER__))
export const Blog = createAsyncRoute(codeSplit('./Blog', __SERVER__))

export default {
  '/blog': [Blog],
  '/': [Home],
}
