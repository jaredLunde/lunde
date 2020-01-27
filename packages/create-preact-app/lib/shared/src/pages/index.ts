import codeSplit from 'code-split.macro'
import {asyncRoute} from '../components'

export const Home = asyncRoute(codeSplit('./Home', __SERVER__))

export default {
  '/': [Home],
}