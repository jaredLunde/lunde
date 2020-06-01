/// <reference types="node" />
import type {Chalk} from 'chalk'
import findPkgJSON from 'find-package-json'
import type {LundleConfig} from './types'
export declare const getPkgJson: (dir?: string) => findPkgJSON.FindResult
export declare const cwd: () => string
export declare function walk(dir: string): Promise<string[]>
export declare const spawn: (
  cmd: string,
  argv: string[]
) => import('child_process').ChildProcess
export declare const loadConfig: (
  configFile?: string
) => Promise<LundleConfig | undefined>
export declare const log: (...msgs: string[]) => void
export declare const error: (...msgs: string[]) => void
export declare const success: (...msgs: string[]) => void
export declare const flag: (
  msg: string,
  color?: Extract<keyof Chalk, string>
) => string
