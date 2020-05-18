import {h} from 'preact'
import {forwardRef, memo} from 'preact/compat'
import css from 'minify-css.macro'
import clsx from 'clsx'
import {styles, color, AppVariables} from '../styles'
import type {LayoutAttributes} from '@dash-ui/react-layout'
import type {Variants} from '../types'

export const Icon: React.FC<IconProps> = memo(
  forwardRef<SVGElement, IconProps>(
    (
      {render, color, variant, className, size = 'md', style, ...props},
      ref
    ) => {
      props.className = clsx(
        className,
        Array.isArray(variant) ? icon(color, ...variant) : icon(color, variant)
      )
      props.ref = ref
      const sizeArr: string[] = String(sizes[size] || size).split('x')
      props.style = {
        ...style,
        width:
          sizeArr.length === 1 || !sizeArr[0]
            ? 'auto'
            : isNaN(sizeArr[0] as any)
            ? sizeArr[0]
            : Number(sizeArr[0]),
        height:
          sizeArr.length === 1
            ? sizeArr[0]
            : !sizeArr[1]
            ? 'auto'
            : isNaN(sizeArr[1] as any)
            ? sizeArr[1]
            : Number(sizeArr[1]),
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
  ...color.styles,
})

const sizes = {
  sm: '0.75em',
  md: '1em',
  lg: '2em',
}

export interface IconProps extends LayoutAttributes {
  color?: keyof AppVariables['color']
  size?: string | number
  sx?: Variants<typeof icon.styles>
  className?: string | string[]
  render: preact.ComponentType<any>
  [prop: string]: any
}
