import system, {pad, gap, radius, shadow, font} from '@-ui/system'
import {icons} from '../components'

system.use({
  pad: pad(),
  gap: gap(),
  font: font(),
  radius: radius(),
  shadow: shadow(),
})

export const variables = {}
export const icon = {icons}
