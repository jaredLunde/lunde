import {h} from 'preact'
import {forwardRef, memo} from 'preact/compat'
import pascal from 'pascalcase'
import css from 'minify-css.macro'
import clsx from 'clsx'
import {useDesignSystem} from './DesignSystem'
import {Variants} from '../types'
import {styles, ds, AppVariables} from '../styles'

export const icon = styles<keyof AppVariables['color'] | 'default'>({
  default: css`
    display: inline-block;
    vertical-align: middle;
    color: currentColor;
  `,
  ...ds.color.styles,
})

const sizes = {
  sm: '0.75em',
  md: '1em',
  lg: '2em',
}

export interface IconProps {
  name: string
  color?: keyof AppVariables['color']
  size?: string | number
  sx?: Variants<typeof icon.styles>
  className?: string | string[]
  [props: string]: any
}

export const Icon: FC<IconProps> = memo(
  forwardRef<SVGElement, Props<IconProps>>(
    ({color, name, sx, className, size = 'md', ...props}, ref) => {
      const {icons} = useDesignSystem()
      props.className = clsx(
        className,
        Array.isArray(sx) ? icon(color, ...sx) : icon(color, sx)
      )
      props.ref = ref
      const sizeArr: string[] = String(sizes[size] || size).split('x')
      props.width = !sizeArr[0]
        ? 'auto'
        : isNaN(sizeArr[0] as any)
        ? sizeArr[0]
        : Number(sizeArr[0])
      props.height = !sizeArr[1]
        ? 'auto'
        : isNaN(sizeArr[1] as any)
        ? sizeArr[1]
        : Number(sizeArr[1])
      props.role = props.hasOwnProperty('role') ? props.role : 'img'
      props['data-icon'] = true
      return h(icons[pascal(name)], props)
    }
  )
)
