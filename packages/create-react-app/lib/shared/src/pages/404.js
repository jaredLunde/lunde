import React from 'react'
import {Helmet} from 'react-helmet-async'
import styles from '@-ui/styles'
import system from '@-ui/system'
import css from 'minify-css.macro'

const NotFound = () => (
  <div className={style('hero')}>
    <Helmet>
      <title>404: Not Found</title>
    </Helmet>
    <div className={style('heading')}>404: Not Found</div>
  </div>
)

const style = styles({
  hero: css`
    display: flex;
    height: 100vh;
    width: 100%;
    justify-content: center;
    align-items: center;
    background-color: #1a1a1f;
  `,
  heading: css`
    ${system.font.css(
      'font=title-sm:phone',
      'font=title:tablet',
      'fontFamily=system'
    )};
    color: white;
  `,
})

export default NotFound
