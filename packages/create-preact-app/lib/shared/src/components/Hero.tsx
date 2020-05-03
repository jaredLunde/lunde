import {h} from 'preact'
import {forwardRef, useEffect, useState} from 'preact/compat'
import clsx from 'clsx'
import css from 'minify-css.macro'
import {useWindowHeight} from '@react-hook/window-size'
import {styles, ds} from '../styles'
import {Variants} from '../types'
import type {LayoutAttributes} from '@dash-ui/react-layout'

export const hero = styles({
  default: ds.mq({
    default: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      position: relative;
      width: 100%;
    `,
    phone: ds.pad.css('lg'),
    tablet: ds.pad.css('xl'),
  }),
})

export interface HeroProps extends LayoutAttributes {
  as?: any
  sx?: Variants<typeof hero.styles>
  className?: string | string[]
}

export const Hero: React.FC<HeroProps> = forwardRef<HTMLElement, HeroProps>(
  ({as = 'div', sx, className, ...props}, ref) => {
    const height = useWindowHeight()
    const [mountStatus, setMountStatus] = useState<'unmounted' | 'mounted'>(
      'unmounted'
    )

    useEffect(() => {
      setMountStatus('mounted')
    }, [])

    return h(
      as,
      Object.assign(props, {
        ref,
        className: clsx(className, Array.isArray(sx) ? hero(...sx) : hero(sx)),
        style: Object.assign(
          {minHeight: mountStatus === 'mounted' ? height : '100vh'},
          props.style
        ),
      })
    )
  }
)
