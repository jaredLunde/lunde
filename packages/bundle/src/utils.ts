import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import {spawn as spawn_} from 'child_process'
import type {Chalk} from 'chalk'
import findPkgJSON from 'find-package-json'
import type {LundleConfig} from './types'

export const getPkgJson = (dir = cwd()) => findPkgJSON(dir).next()
export const cwd = () => process.env.CWD || process.cwd()

export async function walk(dir: string) {
  const out: string[] = []

  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name)
    if (d.isDirectory()) out.push(...(await walk(entry)))
    else if (d.isFile()) out.push(entry)
  }

  return out
}

export const spawn = (cmd: string, argv: string[]) => {
  log(cmd, argv.join(' '))
  return spawn_(cmd, argv, {stdio: 'inherit'})
}

export const loadConfig = async (
  configFile = path.join(
    path.dirname(getPkgJson()?.filename || '.'),
    'lundle.config.js'
  )
): Promise<LundleConfig | undefined> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(configFile)
    return config
    // eslint-disable-next-line no-empty
  } catch (err) {
    console.log('Error', err)
  }
}

export const log = (...msgs: string[]) => console.log(chalk.gray('>'), ...msgs)
export const error = (...msgs: string[]) => log(flag('⃠ ', 'red'), ...msgs)
export const success = (...msgs: string[]) =>
  console.log(flag('✎', 'white'), ...msgs)
export const flag = (
  msg: string,
  color: Extract<keyof Chalk, string> = 'white'
) => `${(chalk.bold as any)[color](msg)}`
