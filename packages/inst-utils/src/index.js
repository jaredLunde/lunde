import pkgUp from 'pkg-up'
import path from 'path'
import ncp from 'ncp'
import fs from 'fs-extra'
import npmUsername from 'username'
import npmEmail from 'npm-email'
import githubUsername from 'github-username'

ncp.limit = 16

export const copy = async (from, to, {include, exclude}) => {
  const dir = path.dirname(to)

  if (fs.existsSync(dir) === false) {
    await fs.ensureDir(dir, 0o744)
  }

  return new Promise((resolve, reject) =>
    ncp(
      from,
      to,
      {
        filter: source => {
          if (typeof exclude === 'function') {
            return exclude(source) === false
          }

          if (typeof include === 'function') {
            return include(source)
          }

          return true
        },
      },
      err => {
        if (err) {
          reject(err)
        }

        resolve()
      }
    )
  )
}

export const getPkgDir = async pkgName => {
  const dir = await pkgUp(require.resolve(pkgName))
  return dir === null ? null : path.dirname(dir)
}

export const getPkgLib = async pkgName => {
  const pkgDir = await getPkgDir(pkgName)
  return pkgDir === null ? null : path.join(pkgDir, 'lib')
}

export const getPackageRepoPages = async (
  {name},
  {org, scope, user: explicitUser}
) => {
  try {
    let user = org || explicitUser

    if (!user) {
      const npmE = await npmEmail(npmUsername.sync())
      user = await githubUsername(npmE)
    }

    name = (scope && user && scope === user) || !scope ? name : scope

    return {
      homepage: `https://github.com/${user}/${name}#readme`,
      repository: `github:${user}/${name}`,
      bugs: `https://github.com/${user}/${name}/issues`,
    }
  } catch (e) {
    return {}
  }
}

export const getPackageName = ({name}, {scope}) =>
  scope ? `@${scope}/${name}` : name
