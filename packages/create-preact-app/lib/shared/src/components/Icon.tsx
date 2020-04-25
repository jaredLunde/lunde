import {h} from 'preact'
import {forwardRef, memo} from 'preact/compat'
import css from 'minify-css.macro'
import clsx from 'clsx'
import {Variants} from '../types'
import {styles, ds, AppVariables} from '../styles'
import type {LayoutAttributes} from '@-ui/react-layout'

export const Icon: React.FC<IconProps> = memo(
  forwardRef<SVGElement, IconProps>(
    ({render, color, name, sx, className, size = 'md', style, ...props}, ref) => {
      props.className = clsx(
        className,
        Array.isArray(sx) ? icon(color, ...sx) : icon(color, sx)
      )
      props.ref = ref
      const sizeArr: string[] = String(sizes[size] || size).split('x')
      props.style = {
        ...style,
        width: !sizeArr[0]
          ? 'auto'
          : isNaN(sizeArr[0] as any)
          ? sizeArr[0]
          : Number(sizeArr[0]),
        height: !sizeArr[1]
          ? 'auto'
          : isNaN(sizeArr[1] as any)
          ? sizeArr[1]
          : Number(sizeArr[1])
      }
      props.role = props.hasOwnProperty('role') ? props.role : 'img'
      props['data-icon'] = true
      return h(render, props)
    }
  )
)

export const icon = styles<keyof AppVariables['color'] | 'default'>({
  default: css`
    display: inline-block;
    vertical-align: middle;
    color: currentColor;
    line-height: 1;
  `,
  ...ds.color.styles,
})

const sizes = {
  sm: '0.75em',
  md: '1em',
  lg: '2em',
}

export interface IconProps extends LayoutAttributes {
  name: string
  color?: keyof AppVariables['color']
  size?: string | number
  sx?: Variants<typeof icon.styles>
  className?: string | string[]
  render: preact.ComponentType<any>;
  [prop: string]: any
}
