import {h} from 'preact'
import {Link} from 'preact-router/match'
import styles from '../styles'

const link = styles({
  active: {
    color: 'blue',
    fontWeight: 700,
  },
})

const header = styles({
  default: {
    width: '100%',
    height: 54,
    background: '#f7f7f7',
  },
})

export const Header = () => (
  <header className={header()}>
    <h1>{`<:PKG_NAME:>`}</h1>
    <nav>
      <Link activeClassName={link('active')} href='/'>
        Home
      </Link>
      <Link activeClassName={link('active')} href='/profile'>
        Me
      </Link>
      <Link activeClassName={link('active')} href='/profile/john'>
        John
      </Link>
    </nav>
  </header>
)
