import createAsyncComponent from 'create-async-component'
import codeSplit from 'code-split.macro'

export const Home = createAsyncComponent(codeSplit('./Home', __SERVER__))
