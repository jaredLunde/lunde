import {h} from 'preact'
import createAsyncComponent from 'create-async-component'
import css from 'minify-css.macro'
import codeSplit from 'code-split.macro'
import {Link} from 'preact-router'
import {styles} from '../../styles'

const posts = {
  'hello-world': createAsyncComponent(
    codeSplit('./hello-world.mdx', __SERVER__)
  ),
}

export default () => {
  return (
    <div className={blog()}>
      <div className={blogHeader()}>
        <Link href='/'>&larr; Home</Link>
      </div>

      {h(posts['hello-world'], {})}
    </div>
  )
}

const blog = styles.one(
  ({pad}) => css`
    width: 100%;
    max-width: 720px;
    padding: ${pad.xl};
    margin: 0 auto;
  `
)

const blogHeader = styles.one(
  ({gap}) => css`
    width: 100%;
    margin-bottom: ${gap.lg};
  `
)
