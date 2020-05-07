import {h} from 'preact'
import {Link} from 'preact-router'
import {Hero, Text} from '../components'

export const Home = () => (
  <Hero>
    <Text sx='heading'>Home</Text>
    <p>This is the Home component.</p>
    <Link href='/blog'>Blog</Link>
  </Hero>
)
