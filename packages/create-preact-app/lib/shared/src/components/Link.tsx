import {h} from 'preact'
import {forwardRef} from 'preact/compat'
import {
  Link as LinkBase,
  NavLink as NavLinkBase,
  LinkProps as RouterLinkProps,
  NavLinkProps as RouterNavLinkProps,
} from 'react-router-dom'
import {Style} from '@-ui/react'
import css from 'minify-css.macro'
import clsx from 'clsx'
import {Variants} from '../types'
import {styles} from '../styles'
import {AsyncRouteType} from './AsyncRoute'

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
    font-weight: 700;import { AsyncRouteType } from './AsyncRoute';

    border-bottom: 1px solid currentColor;
  `,
})

// @ts-ignore
export interface LinkProps extends RouterLinkProps {
  sx?: Variants<typeof link.styles>
  className?: string | string[]
  preload?: AsyncRouteType<any>
}

export const Link: FC<LinkProps> = forwardRef<any, Props<LinkProps>>(
  ({sx, preload, onMouseEnter, ...props}, ref) =>
    h(
      LinkBase,
      Object.assign(props, {
        className: clsx(
          props.className,
          Array.isArray(sx) ? link(...sx) : link(sx)
        ),
        onMouseEnter: e => {
          onMouseEnter?.(e)
          preload?.load()
        },
        ref,
      })
    )
)

// @ts-ignore
export interface NavLinkProps extends RouterNavLinkProps {
  sx?: Variants<typeof link.styles>
  className?: string | string[]
  preload?: AsyncRouteType<any>
}

export const NavLink: FC<NavLinkProps> = forwardRef<any, Props<NavLinkProps>>(
  ({sx, preload, onMouseEnter, ...props}, ref) =>
    h(
      NavLinkBase,
      Object.assign(props, {
        activeClassName: 'active',
        className: clsx(
          props.className,
          Array.isArray(sx) ? link(...sx) : link(sx)
        ),
        onMouseEnter: e => {
          onMouseEnter?.(e)
          preload?.load()
        },
        ref,
      })
    )
)
