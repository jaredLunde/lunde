import {defaultRenderError} from './createRenderer'

// this creates an http handler
export default (
  // function which generates the HTML markup for the app
  render,
  // callback for returning error pages
  renderError = defaultRenderError
) =>
  async function handler(locals) {
    let html

    try {
      html = await render(locals)
    } catch (err) {
      html = renderError ? await renderError(locals, err) : err

      if (process.env.NODE_ENV !== 'production') {
        console.log(err)
      }
    }

    return html
  }
