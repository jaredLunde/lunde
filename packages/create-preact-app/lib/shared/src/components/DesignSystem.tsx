import {h} from 'preact'
import {DashProvider} from '@dash-ui/react'
import {LayoutProvider} from '@dash-ui/react-layout'
import {styles, mediaQueries} from '../styles'
import type {DashVariables, DashThemes} from '@dash-ui/styles'

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
  variables?: DashVariables
  themes?: DashThemes
}
