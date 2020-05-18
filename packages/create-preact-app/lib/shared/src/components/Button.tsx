import {h} from 'preact'
import {forwardRef} from 'preact/compat'
import css from 'minify-css.macro'
import clsx from 'clsx'
import AccessibleButton from '@accessible/button'
import {styles, mq, bg, color} from '../styles'
import {Link} from './Link'
import type {LayoutAttributes} from '@dash-ui/react-layout'
import type {Variants} from '../types'
import type {LinkProps} from './Link'

export const Button: React.FC<ButtonProps> = forwardRef<
  HTMLElement,
  ButtonProps
>(({as = 'button', variant = 'primary', ...props}, ref) => (
  <AccessibleButton>
    {h(
      as,
      Object.assign(props, {
        className: clsx(
          props.className,
          Array.isArray(variant)
            ? (variant && variant.indexOf('outline') > -1
                ? buttonOutline
                : button)(...variant)
            : (variant && variant === 'outline' ? buttonOutline : button)(
                variant
              )
        ),
        ref,
      })
    )}
  </AccessibleButton>
))

export const button = styles<
  'default' | 'primary' | 'outline' | keyof typeof bg.styles
>({
  default: mq({
    default: ({transition, radius, font, gap}) => css`
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
      padding: ${8 / 16}rem ${16 / 16}rem;
      border-radius: ${radius.secondary};
      border: none;
      font-size: ${font.size.content};
      line-height: ${font.leading.content};
      letter-spacing: ${font.tracking.content};
      font-family: ${font.family.brand};
      font-weight: 700;
      color: white;
      transform-origin: center;
      transition: all ${transition.duration.swift} ${transition.timing.move};

      &:active {
        opacity: 1;
      }

      svg {
        margin-right: ${gap.sm};
      }
    `,
    hover: css`
      &:hover {
        transform: scale(1.08);
        opacity: 0.75;
        &:active {
          opacity: 1;
        }
      }
    `,
  }),
  ...bg.styles,
})

export const buttonOutline = styles<
  'default' | 'primary' | 'outline' | keyof typeof color.styles
>({
  default: mq({
    default: ({radius, font, gap}) => css`
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
      padding: ${8 / 16}rem ${16 / 16}rem;
      border-radius: ${radius.primary};
      font-size: ${font.size.content};
      line-height: ${font.leading.content};
      letter-spacing: ${font.tracking.content};
      font-family: ${font.family.brand};
      font-weight: 700;
      border: 1px solid currentColor;
      color: white;
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
  ...color.styles,
})

export interface ButtonProps extends LayoutAttributes {
  as?: any
  variant?: Variants<typeof button.styles | typeof buttonOutline.styles>
  className?: string | string[]
}

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  variant = 'primary',
  ...props
}) =>
  h(
    Link as any,
    Object.assign(props, {
      className: clsx(
        props.className,
        Array.isArray(variant)
          ? (variant && variant.indexOf('outline') > -1
              ? buttonOutline
              : button)(...variant)
          : (variant && variant === 'outline' ? buttonOutline : button)(variant)
      ),
    })
  )

export type ButtonLinkProps = Omit<LinkProps, 'className'> & {
  variant?: Variants<typeof button.styles | typeof buttonOutline.styles>
  className?: string | string[]
}
