import {h} from 'preact'
import {Link as WouterLink} from 'wouter'
import type {LinkProps as WouterLinkProps} from 'wouter'
import type {AsyncComponentGetter} from 'create-async-component'

export const Link: React.FC<LinkProps> = ({preload, ...props}) => (
  <WouterLink
    onTouchStart={preload.load}
    onMouseEnter={preload.load}
    onMouseDown={preload.load}
    {...props}
  />
)

export type LinkProps = WouterLinkProps & {
  preload: React.FC<any> & {
    load: AsyncComponentGetter<any>
  }
}
