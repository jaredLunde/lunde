import {createStyles} from '@dash-ui/styles'
import reset from '@dash-ui/reset'
import dashMq from '@dash-ui/mq'
import * as spacing from '@dash-ui/spacing'
import css from 'minify-css.macro'

//
// CSS variables
export const variables = {
  color: {
    brand: '#202E3B',
    'ui/primary': '#FDFDFD',
    'ui/primaryInverse': '#202E3B',
    'intention/info': '#e6f5f7',
    'intention/infoInverse': '#008489',
    'intention/danger': '#FED7D7',
    'intention/dangerInverse': '#C53030',
    'text/accent': '#767676',
    'text/primary': '#1e1e1e',
    'link/primary': '#1177D4',
  },
  font: {
    family: {
      brand: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
      content: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    },
    size: {
      hero: 64 / 16 + 'rem',
      heading: 24 / 16 + 'rem',
      headingPhone: 18 / 16 + 'rem',
      subheading: 16 / 16 + 'rem',
      content: 14 / 16 + 'rem',
      contentSm: 12 / 16 + 'rem',
      label: 10 / 16 + 'rem',
    },
    leading: {
      hero: 64 / 16 + 'rem',
      heading: 28 / 16 + 'rem',
      headingPhone: 24 / 16 + 'rem',
      subheading: 22 / 16 + 'rem',
      content: 20 / 16 + 'rem',
      contentSm: 17 / 16 + 'rem',
      label: 14 / 16 + 'rem',
    },
    tracking: {
      hero: '-0.022em',
      heading: '-0.019em',
      headingPhone: '-0.014em',
      subheading: '-0.011em',
      content: '-0.006em',
      contentSm: '0em',
      label: '0.01em',
    },
  },
  radius: {
    secondary: 4 / 16 + 'rem',
    primary: 8 / 16 + 'rem',
    max: 1000 / 16 + 'rem',
  },
  elevation: {
    resting: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
    floating: `0px -1.79553px 8.91859px rgba(0,132,137, 0.1282725), 0px -8.0308px 24.8793px rgba(0,132,137, 0.1417275), 0px -30px 124px rgba(0,132,137, 0.27)`,
    inset: `inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)`,
  },
  pad: {
    none: '0',
    xs: 4 / 16 + 'rem',
    sm: 8 / 16 + 'rem',
    md: 16 / 16 + 'rem',
    lg: 32 / 16 + 'rem',
    xl: 64 / 16 + 'rem',
  },
  gap: {
    none: '0',
    auto: 'auto',
    xxs: 1 / 16 + 'rem',
    xs: 2 / 16 + 'rem',
    sm: 4 / 16 + 'rem',
    md: 8 / 16 + 'rem',
    lg: 16 / 16 + 'rem',
    xl: 32 / 16 + 'rem',
    xxl: 64 / 16 + 'rem',
  },
  transition: {
    duration: {
      swift: '160ms',
      primary: '320ms',
    },
    timing: {
      linear: 'linear',
      move: 'cubic-bezier(0.7, 0, 0.6, 1)',
      accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    },
  },
  z: {
    max: 2147483647,
  },
}

const themes = {
  default: variables,
  sandbox: variables,
}

export type AppVariables = typeof variables
export type AppThemes = typeof themes
export const styles = createStyles({
  variables,
  themes,
  mangleVariables: process.env.NODE_ENV === 'production',
})

//
// Breakpoints and media queries
export const mediaQueries = {
  // 0px
  phone: 'only screen and (min-width: 0em)',
  // 560px
  tablet: 'only screen and (min-width: 35em)',
  // 1280px
  desktop: 'only screen and (min-width: 80em)',
  'hi-dpi': css`
     only screen and (-webkit-min-device-pixel-ratio: 1.5),
     only screen and (min--moz-device-pixel-ratio: 1.5),
     only screen and (-o-min-device-pixel-ratio: 1.5/1),
     only screen and (min-resolution: 144dpi),
     only screen and (min-resolution: 1.5dppx)
  `,
  hover: '(hover: hover)',
}

type AppMediaQueries = typeof mediaQueries
export const mq = dashMq<keyof AppMediaQueries, typeof variables>(mediaQueries)

// Coloring
export const bg = styles<keyof typeof variables.color>(
  Object.keys(variables.color).reduce((prev, key) => {
    prev[key] = ({color}) => css`
      background-color: ${color[key]};
    `
    return prev
  }, {})
)

export const color = styles<keyof typeof variables.color>(
  Object.keys(variables.color).reduce((prev, key) => {
    prev[key] = ({color}) => css`
      color: ${color[key]}!important;
    `
    return prev
  }, {})
)

export const gap = spacing.gap(styles, variables.gap)
export const pad = spacing.pad(styles, variables.pad)

//
// Typography
export const font = styles({
  hero: mq({
    phone: ({color, font}) => css`
      font-family: ${font.family.content};
      font-size: ${font.size.heading};
      letter-spacing: ${font.tracking.heading};
      line-height: ${font.leading.heading};
      font-weight: 700;
    `,
    desktop: ({font}) => css`
      font-family: ${font.family.content};
      font-size: ${font.size.hero};
      letter-spacing: ${font.tracking.hero};
      line-height: ${font.leading.hero};
    `,
  }),
  heading: mq({
    phone: ({color, font}) => css`
      font-family: ${font.family.content};
      font-weight: 700;
      font-size: ${font.size.headingPhone};
    `,
    desktop: ({font}) => css`
      font-family: ${font.family.content};
      font-size: ${font.size.heading};
      letter-spacing: ${font.tracking.heading};
      line-height: ${font.leading.heading};
    `,
  }),
  subheading: ({color, font}) => css`
    font-family: ${font.family.content};
    font-weight: 400;
    font-size: ${font.size.subheading};
    letter-spacing: ${font.tracking.subheading};
    line-height: ${font.leading.subheading};
  `,
  content: ({font}) => css`
    font-family: ${font.family.content};
    font-size: ${font.size.content};
    letter-spacing: ${font.tracking.content};
    line-height: ${font.leading.content};
  `,
  contentSm: ({font}) => css`
    font-family: ${font.family.content};
    font-size: ${font.size.contentSm};
    letter-spacing: ${font.tracking.contentSm};
    line-height: ${font.leading.contentSm};
  `,
  label: ({font}) => css`
    font-family: ${font.family.content};
    font-size: ${font.size.label};
    letter-spacing: ${font.tracking.label};
    line-height: ${font.leading.label};
    text-transform: uppercase;
  `,
  badge: ({font}) => css`
    font-family: ${font.family.brand};
    font-size: ${font.size.contentSm};
    letter-spacing: ${font.tracking.label};
    line-height: ${font.leading.label};
    font-weight: 700;
    font-style: italic;
  `,
})

//
// Resets the browser styles that are annoying
styles.global(reset)

//
// Creates global styles
styles.global(
  ({color}) => css`
    * {
      position: relative;
    }

    body {
      ${font.css('content')};
      color: ${color['text/primary']};
      font-weight: 400;
      background: ${color['ui/primary']};
    }

    p {
      ${font.css('content')};
      margin-bottom: 0;
    }

    a {
      ${font.css('content')};
      color: ${color['link/primary']};
      font-weight: 700;
    }

    *:focus {
      outline: none;
    }

    body.using-keyboard *:focus,
    body.using-keyboard .focused {
      outline: 3px solid ${color['ui/primaryInverse']}!important;
    }
  `
)

//
// Type definitions for dash
declare module '@dash-ui/styles' {
  export interface DashVariables extends AppVariables {}
  export interface DashThemes extends AppThemes {}
}

declare module '@dash-ui/react-layout' {
  export interface MediaQueries extends AppMediaQueries {}
}
