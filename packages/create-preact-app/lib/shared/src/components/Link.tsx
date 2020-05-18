import {h} from 'preact'
import {Link as WouterLink} from 'wouter'
import type {LinkProps as WouterLinkProps} from 'wouter'

export const Link: React.FC<LinkProps> = ({preload, ...props}) => (
  <WouterLink
    onTouchStart={preload.load()}
    onMouseEnter={preload.load()}
    onMouseDown={preload.load()}
    {...props}
  />
)

export type LinkProps = WouterLinkProps & {}
