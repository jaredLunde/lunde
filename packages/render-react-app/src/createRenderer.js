import {send} from 'micro'
import httpStatus from 'http-status'
import Cookies from 'cookies'
export {pipe} from './utils'

export const redirect = (res, location, statusCode) => {
  res.setHeader('Location', location)
  res.statusCode = statusCode
  throw 'Redirect'
}

export const withCookies = keys => handler => (req, res) => {
  req.cookies = res.cookies = new Cookies(req, res, {keys})
  return handler(req, res)
}

const robotsCache = {}
export const withRobots = robots => {
  if (robotsCache[robots] === void 0) {
    robotsCache[robots] = next => (req, res) => {
      if ('/robots.txt' === req.url) {
        res.setHeader('Content-Type', 'text/plain')
        res.setHeader(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubdomains; preload'
        )
        res.setHeader('X-XSS-Protection', '1; mode=block')
        res.setHeader('Vary', 'Accept-Encoding')
        res.setHeader('Cache-Control', 'public, max-age=604800')
        send(res, 200, robots)
      } else {
        next(req, res)
      }
    }
  }

  return robotsCache[robots]
}

export const noFavicon = next => (req, res) => {
  if (req.url === '/favicon.ico') {
    send(res, 404, '')
  } else {
    next(req, res)
  }
}

export const defaultRenderError = (req, res, err) => {
  const strErr = err.toString()
  const statusText = httpStatus[res ? res.statusCode : 500]

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${statusText}</title>
        <style> 
           body {
             background: #19181a; 
             padding: 2rem; 
             font-family: Hack, monospace;
           }
           body > div {
             margin: 0 auto;
             max-width: 720px;
           }
           pre, code {
             font-family: Menlo, Hack, monospace!important; 
             color: #a8aaa6; 
             font-size: 0.8rem;
             border-left: 4px solid #a8aaa6;
             padding-left: 1rem;
             margin: 0;
           }
           code {
             border: none; 
             padding: 0;
             font-size: 1.2rem;
             margin-bottom: 1rem;
             display: block;
           }
           h1 {
             font-size: 3rem;
             color: #ff5e54; 
             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
           }
           h1 span {
             display: block;
             font-size: 1.25rem;
             color: #a8aaa6;
             margin-bottom: 3rem;
           }
        </style>
      </head>
      <body>
        <div>
          <h1>Error <span>${
            res ? res.statusCode : 500
          } ${statusText}</span></h1>
          <code>${strErr.split('\n')[0]}</code>
          <pre>${strErr
            .split('\n')
            .slice(1)
            .join('\n')}</pre>
          <pre>${err.stack}</pre>
        </div>
      </body>
    </html>
  `
}

// this creates an http handler
export default (
  // function which generates the HTML markup for the app
  render,
  // callback for returning error pages
  renderError = defaultRenderError
) => async (req, res) => {
  // we will always be returning HTML from this server
  res.setHeader('Content-Type', 'text/html')
  // a feature of Internet Explorer, Chrome and Safari that stops pages
  // from loading when they detect reflected cross-site scripting (XSS)
  // attacks
  res.setHeader('X-XSS-Protection', '1; mode=block')
  // fixes caching issues when using gzip compression
  res.setHeader('Vary', 'Accept-Encoding')
  let html

  try {
    // sends the request with micro
    html = await render(req, res)
    // eslint-disable-next-line require-atomic-updates
    res.statusCode = res.statusCode || 200
  } catch (err) {
    if (res.statusCode >= 300 && res.statusCode < 400) {
      // handles redirections
      return res.end()
    } else {
      // gets rendered error
      // eslint-disable-next-line require-atomic-updates
      res.statusCode =
        res.statusCode === 200 || res.statusCode === void 0
          ? 500
          : res.statusCode
      html = renderError ? await renderError(req, res, err) : err
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(err)
    }
  }

  // sends the response body via micro
  send(res, res.statusCode, html)
}
