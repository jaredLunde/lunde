import codeSplit from 'code-split.macro'
import {createAsyncRoute} from '../router'

export const Home = createAsyncRoute(codeSplit('./Home', __SERVER__))
export const Blog = createAsyncRoute(codeSplit('./Blog', __SERVER__))

export default {
  blog: [Blog],
  home: [Home],
}
