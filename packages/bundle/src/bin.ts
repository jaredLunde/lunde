import {babel} from './babel'
import {rollup} from './rollup'
import {log, error} from './utils'

export const bin = () => {
  log('== ʟᴜɴᴅʟᴇ ==')

  babel({watch: true}).catch((err) => {
    error('[ʀᴏʟʟᴜᴘ] compilation error\n')
    console.error(err)
    process.exit(1)
  })

  rollup({watch: false}).catch((err) => {
    error('[ʙᴀʙᴇʟ] compilation error\n')
    console.error(err)
    process.exit(1)
  })
}

bin()
