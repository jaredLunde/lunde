import React from 'react'
import {Helmet} from 'react-helmet-async'
import {useQuery} from 'react-apollo'
import gql from 'graphql-tag'
import {Text, Box} from 'curls'

const Home = () => {
  const {loading, error, data} = useQuery(
    gql`
      {
        hello
      }
    `
  )

  return (
    <Box flex h='100vh' w='100%' justify='center' align='center'>
      <Helmet>
        <title>Hello world</title>
      </Helmet>

      <Text as='h1' size='xl@desktop lg@phone'>
        Hello world
      </Text>

      {error ? (
        `Error: ${error.message}`
      ) : loading ? (
        'Loading...'
      ) : (
        <Text as='pre' center>
          {JSON.stringify(data.hello)}
        </Text>
      )}
    </Box>
  )
}

export default Home
