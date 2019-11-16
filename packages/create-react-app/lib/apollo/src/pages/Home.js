import React from 'react'
import {Helmet} from 'react-helmet-async'
import {useQuery} from 'react-apollo'
import gql from 'graphql-tag'
import styles from '@-ui/react'
import system from '@-ui/system'
import css from 'minify-css.macro'

const Home = () => {
  const {loading, error, data} = useQuery(
    gql`
      {
        hello
      }
    `
  )

  return (
    <div className={style('hero')}>
      <Helmet>
        <title>Hello world</title>
      </Helmet>

      <div className={style('heading')}>Hello world</div>

      {error ? (
        `Error: ${error.message}`
      ) : loading ? (
        'Loading...'
      ) : (
        <pre className={style('response')}>{JSON.stringify(data.hello)}</pre>
      )}
    </div>
  )
}

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
  response: css`
    text-align: center;
  `,
})

export default Home
