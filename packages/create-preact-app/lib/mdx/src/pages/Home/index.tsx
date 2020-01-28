import {h} from 'preact'
import {Hero, Text, Link} from '../../components'
import {Blog} from '../'

const Home = () => (
  <Hero>
    <Text sx='heading'>Home</Text>
    <p>This is the Home component.</p>
    <Link to='/blog' preload={Blog}>
      Blog
    </Link>
  </Hero>
)

export default Home
