import css from 'minify-css.macro'
import dashStyles from '@dash-ui/react'
import reset from '@dash-ui/reset'
import dashMq from '@dash-ui/mq'
import dashGrid, {Grid12} from '@dash-ui/grid'
import {gap as dashGap, pad as dashPad} from '@dash-ui/spacing'
import type {MediaQueries} from '@dash-ui/react-layout'

//
// CSS variables
export const variables = {
  contentWidth: '960px',
  color: {
    primary: '#0070F3',
    green: '#6ADAAB',
    red: '#D96269',
    yellow: '#F2E399',
    white: '#F8F9FC',
  },
  font: {
    family: {
      brand:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      system:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    size: {},
    color: {
      important: '#000',
      primary: '#B8BAB8',
    },
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    max: '1000px',
  },
  elevation: {
    xs: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`,
    sm: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) `,
    md: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`,
    lg: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
    xl: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
    inner: `inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)`,
  },
  pad: {
    xs: `0.2rem`,
    sm: `0.5rem`,
    md: `1rem`,
    lg: `2rem`,
    xl: `4rem`,
  },
  gap: {
    xxs: `0.0625rem`,
    xs: `0.125rem`,
    sm: `0.25rem`,
    md: `0.5rem`,
    lg: `1rem`,
    xl: `2rem`,
    xxl: `4rem`,
  },
}

export type AppVariables = typeof variables

//
// Dash
export const styles = dashStyles.create({
  key: '',
  variables,
})

//
// Grid
export const grid = dashGrid<Grid12>(styles, 12)

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

//
// Spacing scale
export const gap = dashGap(styles, variables.gap)
export const pad = dashPad(styles, variables.pad)

// Coloring
export const bg = styles<keyof typeof variables.color>(
  Object.keys(variables.color).reduce((prev, key) => {
    prev[key] = ({color}) =>
      css`
        background-color: ${color[key]};
      `
    return prev
  }, {})
)

export const color = styles<keyof typeof variables.color>(
  Object.keys(variables.color).reduce((prev, key) => {
    prev[key] = ({color}) =>
      css`
        color: ${color[key]}!important;
      `
    return prev
  }, {})
)

//
// Typography
export const font = styles({
  heading: ({font, gap}) => css`
    font-family: ${font.family.brand};
    font-weight: 900;
    font-size: 1rem;
    letter-spacing: -0.0275em;
    margin-bottom: ${gap.md};
    color: ${font.color.important};
  `,
  heroHeading: mq({
    default: ({font, gap}) => css`
      font-family: ${font.family.brand};
      font-weight: 900;
      letter-spacing: -0.0275em;
      font-size: 2.67rem;
      line-height: 1.1;
      color: ${font.color.important};
      margin-bottom: ${gap.sm};
    `,
    tablet: css`
      font-size: 6rem;
    `,
    desktop: css`
      font-size: 8rem;
    `,
  }),
  headingSm: mq({
    default: ({font}) => css`
      font-family: ${font.family.system};
      font-weight: 400;
      font-size: 1.25rem;
      letter-spacing: -0.0125em;
      line-height: 1.125;
      color: ${font.color.primary};
    `,
    tablet: css`
      font-size: 1.33rem;
    `,
  }),
  body: ({font}) => css`
    font-family: ${font.family.system};
    font-weight: 400;
    font-size: 1rem;
    letter-spacing: -0.0125em;
    color: ${font.color.primary};
  `,
  bodySm: ({font}) => css`
    font-family: ${font.family.system};
    font-weight: 400;
    font-size: ${14 / 16}rem;
    letter-spacing: -0.0125em;
    color: ${font.color.primary};
  `,
})

//
// Design system group to avoid css variable/system name collisions
// in CSS callbacks
export const ds = {
  mq,
  gap,
  pad,
  grid,
  font,
  bg,
  color,
  styles,
}

//
// Resets the browser styles that are annoying
styles.global(reset)

//
// Creates global styles
styles.global(
  ({font, color}) => css`
    body {
      ${ds.font.css('body')};
      background: ${color.white};
    }

    p {
      ${ds.font.css('body')};
      margin-bottom: 1em;
    }

    a {
      ${ds.font.css('body')};
      color: ${color.primary};
    }

    *:focus {
      outline: none;
    }

    body.using-keyboard *:focus,
    body.using-keyboard .focused {
      outline: 3px solid ${font.color.important}!important;
    }
  `
)

//
// Type definitions for dash
declare module '@dash-ui/styles' {
  export interface DashVariables extends AppVariables {}
}

declare module '@dash-ui/react-layout' {
  export interface MediaQueries extends AppMediaQueries {}
}
