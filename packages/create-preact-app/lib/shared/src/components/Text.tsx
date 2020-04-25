import {h} from 'preact'
import {forwardRef} from 'preact/compat'
import clsx from 'clsx'
import css from 'minify-css.macro'
import {Variants} from '../types'
import {styles, ds, variables} from '../styles'
import type {LayoutAttributes} from '@-ui/react-layout'

export const Text: React.FC<TextProps> = forwardRef<
  HTMLElement,
  TextProps
>(({as = 'span', sx, className, ...props}, ref) =>
  h(
    as,
    Object.assign(props, {
      ref,
      className: clsx(className, Array.isArray(sx) ? text(...sx) : text(sx)),
    })
  )
)

export const text = styles<
  keyof typeof ds.font.styles | keyof typeof variables.font.color
>({
  ...ds.font.styles,
  ...Object.keys(variables.font.color).reduce((prev, key) => {
    prev[key] = ({font}) =>
      css`
        color: ${font.color[key]}!important;
      `
    return prev
  }, {}),
})

export interface TextProps extends LayoutAttributes {
  as?: any
  sx?: Variants<typeof text.styles>
  className?: string | string[]
}
