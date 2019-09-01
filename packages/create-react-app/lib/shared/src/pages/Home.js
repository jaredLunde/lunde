import React from 'react'
import {Helmet} from 'react-helmet-async'
import {Box, Text} from 'curls'

const Home = () => (
  <Box flex h='100vh' w='100%' justify='center' align='center'>
    <Helmet>
      <title>Hello world</title>
    </Helmet>
    <Text as='h1' size='xl@desktop lg@phone'>
      Hello world
    </Text>
  </Box>
)

export default Home
