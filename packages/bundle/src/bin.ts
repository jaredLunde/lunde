import {babel} from './babel'
import {rollup} from './rollup'
import {tsc} from './tsc'
import {log, error} from './utils'

export const bin = () => {
  log('== ʟᴜɴᴅʟᴇ ==')

  babel({watch: true}).catch((err) => {
    error('[𝙗𝙖𝙗𝙚𝙡] compilation error\n')
    console.error(err)
    process.exit(1)
  })

  rollup({watch: true}).catch((err) => {
    error('[𝙧𝙤𝙡𝙡𝙪𝙥] compilation error\n')
    console.error(err)
    process.exit(1)
  })

  tsc({watch: true}).catch((err) => {
    error('[𝙩𝙨𝙘] compilation error\n')
    console.error(err)
    process.exit(1)
  })
}

bin()
