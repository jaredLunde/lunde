import {h} from 'preact'
import {forwardRef} from 'preact/compat'
import clsx from 'clsx'
import css from 'minify-css.macro'
import {Variants} from '../types'
import {styles, ds, variables} from '../styles'

export const text = styles<
  keyof typeof ds.font.styles | keyof typeof variables.font.color
>({
  ...ds.font.styles,
  ...Object.keys(variables.font.color).reduce((prev, key) => {
    prev[key] = ({color}) =>
      css`
        color: ${color[key]};
      `
    return prev
  }, {}),
})

export interface TextProps {
  as?: any
  sx?: Variants<typeof text.styles>
  className?: string | string[]
}

export const Text: FC<TextProps> = forwardRef<HTMLElement, Props<TextProps>>(
  ({as = 'span', sx, className, ...props}, ref) =>
    h(
      as,
      Object.assign(props, {
        ref,
        className: clsx(className, Array.isArray(sx) ? text(...sx) : text(sx)),
      })
    )
)
