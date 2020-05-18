import {h} from 'preact'
import {forwardRef, useEffect, useState} from 'preact/compat'
import {useWindowHeight} from '@react-hook/window-size'
import clsx from 'clsx'
import css from 'minify-css.macro'
import {styles, mq, pad} from '../styles'
import type {LayoutAttributes} from '@dash-ui/react-layout'
import type {Variants} from '../types'

export const hero = styles({
  default: mq({
    default: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      position: relative;
      width: 100%;
    `,
    phone: pad.css('lg'),
    tablet: pad.css('xl'),
  }),
})

export interface HeroProps extends LayoutAttributes {
  as?: any
  variant?: Variants<typeof hero.styles>
  className?: string | string[]
}

export const Hero: React.FC<HeroProps> = forwardRef<HTMLElement, HeroProps>(
  ({as = 'div', variant, className, ...props}, ref) => {
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
        className: clsx(
          className,
          Array.isArray(variant) ? hero(...variant) : hero(variant)
        ),
        style: Object.assign(
          {minHeight: mountStatus === 'mounted' ? height : '100vh'},
          props.style
        ),
      })
    )
  }
)
