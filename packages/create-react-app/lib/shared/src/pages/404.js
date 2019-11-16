import React from 'react'
import {Helmet} from 'react-helmet-async'
import styles from '@-ui/styles'
import system from '@-ui/system'
import css from 'minify-css.macro'

const style = styles({
  hero: css`
    display: flex;
    height: 100vh;
    width: 100%;
    justify-content: center;
    align-items: center;
  `,
  heading: system.font.css('fontSize=xl:phone', 'fontSize=2xl:tablet')
})

const NotFound = () => (
  <div className={style('hero')}>
    <Helmet>
      <title>404: Not Found</title>
    </Helmet>
    <div className={style('heading')}>
      404: Not Found
    </div>
  </div>
)

export default NotFound
