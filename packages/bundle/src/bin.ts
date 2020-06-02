import {babel} from './babel'
import {rollup} from './rollup'
import {tsc} from './tsc'
import {log, error} from './utils'

export const bin = () => {
  log('== ʟᴜɴᴅʟᴇ ==')

  babel({watch: true}).catch((err) => {
    error('[ʀᴏʟʟᴜᴘ] compilation error\n')
    console.error(err)
    process.exit(1)
  })

  rollup({watch: true}).catch((err) => {
    error('[ʙᴀʙᴇʟ] compilation error\n')
    console.error(err)
    process.exit(1)
  })

  tsc({watch: true})
}

bin()
