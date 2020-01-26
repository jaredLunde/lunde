import {h} from 'preact'
import {forwardRef} from 'preact/compat'
import css from 'minify-css.macro'
import clsx from 'clsx'
import {useHistory, LinkProps} from 'react-router-dom'
import AccessibleButton from '@accessible/button'
import Link from '@accessible/link'
import {styles, ds, variables} from '../styles'
import {Variants} from '../types'

export const button = styles<
  'default' | 'primary' | 'outline' | keyof typeof ds.bg.styles
>({
  default: ds.mq({
    default: ({color, radius, font, gap}) => css`
      margin: 0;
      text-decoration: none;
      -webkit-font-smoothing: inherit;
      -moz-osx-font-smoothing: inherit;
      -webkit-appearance: none;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      user-select: none;
      line-height: 1;
      padding: ${10 / 16}rem ${24 / 16}rem;
      border-radius: ${radius.sm};
      border: none;
      ${ds.font.css('body')};
      font-family: ${font.family.brand};
      font-weight: 700;
      color: ${color.white};
      transform-origin: center;
      transition: all 100ms ease-out;

      &:active {
        opacity: 1;
      }

      svg {
        margin-right: ${gap.sm};
      }
    `,
    hover: css`
      &:hover {
        transform: scale(1.05);
        opacity: 0.75;
        &:active {
          opacity: 1;
        }
      }
    `,
  }),
  ...ds.bg.styles,
})

export const buttonOutline = styles<
  'default' | 'primary' | 'outline' | keyof typeof ds.bg.styles
>({
  default: ds.mq({
    default: ({color, radius, font, gap}) => css`
      margin: 0;
      text-decoration: none;
      -webkit-font-smoothing: inherit;
      -moz-osx-font-smoothing: inherit;
      -webkit-appearance: none;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      user-select: none;
      line-height: 1;
      padding: ${10 / 16}rem ${24 / 16}rem;
      border-radius: ${radius.sm};
      ${ds.font.css('body')};
      font-family: ${font.family.brand};
      font-weight: 700;
      border: 1px solid currentColor;
      color: ${color.white};
      transform-origin: center;
      transition: all 100ms ease-out;
      background-color: transparent;

      svg {
        margin-right: ${gap.sm};
      }
    `,
    hover: css`
      &:hover {
        transform: scale(1.05);
        opacity: 0.75;

        &:active {
          opacity: 1;
        }
      }
    `,
  }),
  ...ds.color.styles,
})

export interface ButtonProps {
  as?: any
  sx?: Variants<typeof button.styles | typeof buttonOutline.styles>
  color?: keyof typeof variables.color
  className?: string | string[]
  [props: string]: any
}

export const Button: FC<ButtonProps> = forwardRef<HTMLElement, ButtonProps>(
  ({as = 'button', sx = 'primary', color = 'primary', ...props}, ref) => (
    <AccessibleButton>
      {h(
        as,
        Object.assign(props, {
          className: clsx(
            props.className,
            Array.isArray(sx)
              ? (sx && sx.indexOf('outline') ? buttonOutline : button)(
                  color,
                  ...sx
                )
              : (sx && sx === 'outline' ? buttonOutline : button)(color, sx)
          ),
          ref,
        })
      )}
    </AccessibleButton>
  )
)

// @ts-ignore
export interface ButtonLinkProps extends ButtonProps, LinkProps {
  to: string
  className?: string | string[]
  state: Record<string, any>
  children?: JSX.Element | string | false | number | null
}

export const ButtonLink: FC<ButtonLinkProps> = forwardRef<
  HTMLElement,
  ButtonLinkProps
>(({to, replace = false, state, ...props}, ref) => {
  const history = useHistory()

  return (
    <Link>
      <Button
        as='a'
        onClick={(e: MouseEvent) => {
          if (
            e.ctrlKey ||
            e.metaKey ||
            e.altKey ||
            e.shiftKey ||
            e.button !== 0
          )
            return
          history[replace ? 'replace' : 'push'](to, state)
          e.preventDefault()
        }}
        ref={ref}
        {...props}
      />
    </Link>
  )
})
