import {h} from 'preact'
import {DashProvider, Themes, Variables} from '@-ui/react'
import {LayoutProvider} from '@-ui/react-layout'
import {styles, mediaQueries} from '../styles'

export const DesignSystem: React.FC<DesignSystemProps> = ({
  variables,
  themes,
  children,
}) => (
  <DashProvider dash={styles} themes={themes} variables={variables}>
    <LayoutProvider mediaQueries={mediaQueries}>{children}</LayoutProvider>
  </DashProvider>
)

export interface DesignSystemProps {
  variables?: Variables
  themes?: Themes
}
