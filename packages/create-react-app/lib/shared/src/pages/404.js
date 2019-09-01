import React from 'react'
import {Helmet} from 'react-helmet-async'
import {Box, Text} from 'curls'

const NotFound = () => (
  <Box flex h='100vh' w='100%' justify='center' align='center'>
    <Helmet>
      <title>404: Not Found</title>
    </Helmet>
    <Text as='h1' size='xl@desktop lg@phone'>
      404: Not Found
    </Text>
  </Box>
)

export default NotFound
