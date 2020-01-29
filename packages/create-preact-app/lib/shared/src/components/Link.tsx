import {h} from 'preact'
import {forwardRef} from 'preact/compat'
import {Style} from '@-ui/react'
import css from 'minify-css.macro'
import clsx from 'clsx'
import {
  Link as AsyncLink,
  NavLink as AsyncNavLink,
  LinkProps as AsyncLinkProps,
  NavLinkProps as AsyncNavLinkProps,
} from 'create-async-route'
import {Variants} from '../types'
import {styles} from '../styles'

export const link: Style = styles({
  default: ({color, font}) => css`
    color: ${color.primary};
    text-decoration: none;
    padding-bottom: 0.125em;
    font-family: ${font.family.system};

    &.active {
      font-weight: 700;
    }
  `,
  secondary: ({font}) => css`
    color: ${font.color.important};
    font-weight: 700;

    border-bottom: 1px solid currentColor;
  `,
})

// @ts-ignore
export interface LinkProps extends AsyncLinkProps {
  sx?: Variants<typeof link.styles>
  className?: string | string[]
}

export const Link: FC<LinkProps> = forwardRef<any, Props<LinkProps>>(
  ({sx, ...props}, ref: any) =>
    h(
      AsyncLink,
      Object.assign(props, {
        className: clsx(
          props.className,
          Array.isArray(sx) ? link(...sx) : link(sx)
        ),
        ref,
      })
    )
)

// @ts-ignore
export interface NavLinkProps extends AsyncNavLinkProps {
  sx?: Variants<typeof link.styles>
  className?: string | string[]
}

export const NavLink: FC<NavLinkProps> = forwardRef<any, Props<NavLinkProps>>(
  ({sx, ...props}, ref: any) =>
    h(
      AsyncNavLink,
      Object.assign(props, {
        activeClassName: 'active',
        className: clsx(
          props.className,
          Array.isArray(sx) ? link(...sx) : link(sx)
        ),
        ref,
      })
    )
)
