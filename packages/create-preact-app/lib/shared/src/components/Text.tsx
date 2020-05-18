import {h} from 'preact'
import {forwardRef} from 'preact/compat'
import clsx from 'clsx'
import css from 'minify-css.macro'
import {styles, font, variables} from '../styles'
import type {LayoutAttributes} from '@dash-ui/react-layout'
import type {Variants} from '../types'

export const Text: React.FC<TextProps> = forwardRef<HTMLElement, TextProps>(
  ({as = 'span', variant, className, ...props}, ref) =>
    h(
      as,
      Object.assign(props, {
        ref,
        className: clsx(
          className,
          Array.isArray(variant) ? text(...variant) : text(variant)
        ),
      })
    )
)

export const text = styles<
  keyof typeof font.styles | keyof typeof variables.color
>({
  ...font.styles,
  ...Object.keys(variables.color).reduce((prev, key) => {
    prev[key] = ({color}) =>
      css`
        color: ${color[key]}!important;
      `
    return prev
  }, {}),
})

export interface TextProps extends LayoutAttributes {
  as?: any
  variant?: Variants<typeof text.styles>
  className?: string | string[]
}
