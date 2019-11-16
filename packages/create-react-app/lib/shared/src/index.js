import React from 'react'
import {Switch} from 'react-router-dom'
import {HelmetProvider, Helmet} from 'react-helmet-async'
import {Provider as BrokerProvider} from 'react-broker'
import styles, {DashProvider, Global} from '@-ui/react'
import {browserStyles} from '@-ui/system'
import {ScrollToTop} from './components'
import * as theme from './theme'
import * as pages from './pages'

const Document = ({location}) => (
  <>
    <Helmet>
      <html lang='en' />
      <meta charSet='utf-8' />
      <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='black' />
      <meta
        name='viewport'
        content='width=device-width, user-scalable=yes, initial-scale=1.0'
      />
      <meta name='theme-color' content='#000' />
      {__webpack_public_path__.startsWith('http') && (
        <link
          rel='dns-prefetch preconnect'
          href={__webpack_public_path__}
          crossOrigin
        />
      )}
      <noscript>
        {`
          <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
            Javascript must be enabled in order to view this website
          </div>
        `}
      </noscript>
    </Helmet>
    <Global css={browserStyles}/>
    <div id='portals' />
    <Switch
      location={location}
      children={Object.values(pages).map(({route}) => route)}
    />
  </>
)

export default ({helmetContext = {}, chunkCache}) => (
  <HelmetProvider context={helmetContext}>
    <DashProvider styles={styles} variables={theme.variables}>
      <BrokerProvider chunkCache={chunkCache}>
        <ScrollToTop path='*' children={Document} />
      </BrokerProvider>
    </DashProvider>
  </HelmetProvider>
)
