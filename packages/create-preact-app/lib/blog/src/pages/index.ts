import codeSplit from 'code-split.macro'
import {asyncRoute} from '../components'

export const Home = asyncRoute(codeSplit('./Home', __SERVER__))
export const Blog = asyncRoute(codeSplit('./Blog', __SERVER__))

export default {
  '/blog': [Blog],
  '/': [Home],
}
