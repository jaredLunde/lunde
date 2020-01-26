import {h} from 'preact'
import {useContext, useMemo, createContext} from 'preact/compat'
import {DashProvider, Themes, Variables} from '@-ui/react'
import * as defaultIcons from './icons'
import {styles} from '../styles'

export interface DesignSystemContextValue {
  variables?: Variables
  themes?: Themes
  icons: Record<string, FC<any>>
}

const DesignSystemContext = createContext<DesignSystemContextValue>({
  icons: {},
})
export const useDesignSystem = () => useContext(DesignSystemContext)

export interface DesignSystemProps {
  variables?: Variables
  themes?: Themes
  icons?: Record<string, FC<any>>
}

export const DesignSystem: FC<DesignSystemProps> = ({
  variables,
  themes,
  icons,
  children,
}) => (
  <DesignSystemContext.Provider
    value={useMemo(
      () => ({
        variables,
        themes,
        icons: icons ? Object.assign({}, defaultIcons, icons) : defaultIcons,
      }),
      [variables, themes, icons]
    )}
  >
    <DashProvider
      dash={styles}
      themes={themes}
      variables={variables}
      children={children}
    />
  </DesignSystemContext.Provider>
)
