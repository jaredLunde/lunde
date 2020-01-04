import dashStyles from '@-ui/react'
import dashSystem, {
  pad,
  gap,
  radius,
  shadow,
  font,
  resetBrowserStyles,
} from '@-ui/system'
import css from 'minify-css.macro'

// CSS-in-JS with Dash styles
export const styles = dashStyles.create({key: '', speedy: !__DEV__})
// Creates global CSS variables
export const variables = {}
styles.variables(variables)
// Creates the style system
export const system = dashSystem.create(styles, {
  plugins: {
    // padding scale
    pad: pad(),
    // margin scale
    gap: gap(),
    // font styles and variables
    font: font(),
    // border-radius scale
    radius: radius(),
    // box-shadow scale
    shadow: shadow(),
  },
})
// Resets the browser styles that are annoying
resetBrowserStyles(styles)
// Creates global styles
styles.global(css`
  body {
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 0.875rem;
  }
`)
// Lets you access the style system from the styles object
styles.system = system
export default styles
