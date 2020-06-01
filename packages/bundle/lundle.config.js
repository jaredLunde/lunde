import jest from './jest.config.js'
let DEBUGGED = false

export const babel = (config) => {
  if (!DEBUGGED)
    console.log(`\n[ʙᴀʙᴇʟ] config\n${JSON.stringify(config, null, 2)}\n`)
  DEBUGGED = true
  return config
}
