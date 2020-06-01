import fs from 'fs'
import path from 'path'
import Module from 'module'
import {spawn as spawn_} from 'child_process'
import vm from 'vm'
import {transformFileAsync} from '@babel/core'
import chalk from 'chalk'
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
    // Allows ES6 lundle configs
    const t = await transformFileAsync(configFile, {
      presets: [
        [
          '@lunde/es',
          {
            env: {
              modules: 'commonjs',
              targets: {
                node: 'current',
              },
            },
            devExpression: false,
            typescript: true,
          },
        ],
      ],
      plugins: [],
    })
    // Run this in a VM context for safer eval
    const wrapper = vm.runInThisContext(
      Module.wrap(t?.code || '"use strict"'),
      {
        filename: configFile,
      }
    )
    // Call the wrapper with our custom exports
    const config: LundleConfig = {}

    wrapper.call(
      config,
      config,
      require,
      // @ts-ignore
      this,
      configFile,
      path.dirname(configFile)
    )

    return config
  } catch (err) {
    console.error(err)
    process.exit(1)
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
