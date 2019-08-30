import {defaultRenderError} from './createRenderer'
import {send} from 'micro'
export * from './createRenderer'

// this creates an http handler
export default (
  // function which generates the HTML markup for the app
  render,
  // callback for returning error pages
  renderError = defaultRenderError
) =>
  async function handler(req, res) {
    // we will always be returning HTML from this server
    res.setHeader('Content-Type', 'text/html')
    // a feature of Internet Explorer, Chrome and Safari that stops pages
    // from loading when they detect reflected cross-site scripting (XSS)
    // attacks
    res.setHeader('X-XSS-Protection', '1; mode=block')
    // fixes caching issues when using gzip compression
    res.setHeader('Vary', 'Accept-Encoding')

    try {
      // sends the request with micro
      await render(req, res)
    } catch (err) {
      let html

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

      send(res, html, res.statusCode, html)
    }
  }
