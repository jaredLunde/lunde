import {h} from 'preact'
import {Style} from '@dash-ui/react'
import css from 'minify-css.macro'
import clsx from 'clsx'
import {
  Link as AsyncLink,
  NavLink as AsyncNavLink,
} from 'react-router-typed/dom'
import {Variants} from '../types'
import {styles} from '../styles'
import type {
  RouteTypes,
  RouteTo,
  LinkProps as AsyncLinkProps,
  NavLinkProps as AsyncNavLinkProps,
} from 'react-router-typed/dom'

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

export type LinkProps<To extends RouteTo = RouteTo> = AsyncLinkProps<
  RouteTypes,
  To
> & {
  sx?: Variants<typeof link.styles>
  className?: string | string[]
}

export const Link = <To extends RouteTo = RouteTo>({
  sx,
  ...props
}: LinkProps<To>) =>
  h(
    AsyncLink,
    Object.assign(props, {
      className: clsx(
        props.className,
        Array.isArray(sx) ? link(...sx) : link(sx)
      ),
    })
  )

export type NavLinkProps<To extends RouteTo = RouteTo> = AsyncNavLinkProps<
  RouteTypes,
  To
> & {
  sx?: Variants<typeof link.styles>
  className?: string | string[]
}

export const NavLink = <To extends RouteTo = RouteTo>({
  sx,
  ...props
}: NavLinkProps<To>) =>
  h(
    AsyncNavLink,
    Object.assign(props, {
      activeClassName: 'active',
      className: clsx(
        props.className,
        Array.isArray(sx) ? link(...sx) : link(sx)
      ),
    })
  )
