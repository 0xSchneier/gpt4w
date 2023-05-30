import { app } from 'electron'
// import { homedir } from 'os'
import path, { join } from 'node:path'
import { dictionary } from './mnemonic-dictonary'

export function getResourcePath() {
  return app.isPackaged
    ? path.join(process.resourcesPath)
    : path.join(__dirname, '../../')
}

export function resolveAssetPath(filename = '') {
  const root = getResourcePath()
  return path.join(root, 'assets', filename)
}

export function getSavePath() {
  // return app.isPackaged ? homedir() : process.cwd()
  return app.isPackaged ? join(app.getPath('appData'), app.name) : process.cwd()
}

export function getAppData() {
  // The expect result is:
  // OS X - '/Users/user/Library/Preferences'
  // Windows 8 - 'C:\Users\user\AppData\Roaming'
  // Windows XP - 'C:\Documents and Settings\user\Application Data'
  // Linux - '/home/user/.local/share'
  return (
    process.env.APPDATA ||
    (process.platform == 'darwin'
      ? process.env.HOME + '/Library/Preferences'
      : process.env.HOME + '/.local/share')
  )
}

/**
 * @author huangyingzheng
 * @description explain
 * Matching words are represented by 18 words
 * There are 4096 words in the aids, which are converted into a 2^12 in a way to convert to 2 as the bottom.Then that is, a notes can indicate a 12bit number
 * use UINT8ARRAY to save the data, then the size of each space is 8bit, which is represented by hex.In the case, in order to show the number to the greatest extent, the two aid words should be 3 numbers.In other words, 2
 * single notes = 3 * Uint8array (1)
 * So 18 aid words correspond to New UINT8ARAY (27)
 */

export const encodeMnemonic = async (seed: Uint8Array): Promise<string[]> => {
  try {
    const ret = []
    for (let i = 0; i < 9; i++) {
      const x = seed[i * 3] + (seed[i * 3 + 1] % 16) * 256
      const y = (seed[i * 3 + 1] >> 4) + seed[i * 3 + 2] * 16
      ret.push(dictionary[x])
      ret.push(dictionary[y])
    }
    return ret
  } catch (e) {
    return Promise.reject(e)
  }
}

export const decodeMnemonic = async (
  mnemonic: string[]
): Promise<Uint8Array> => {
  try {
    const ret = new Uint8Array(27)

    for (let i = 0; i < 9; i++) {
      const x = dictionary.indexOf(mnemonic[i * 2])
      const y = dictionary.indexOf(mnemonic[i * 2 + 1])

      if (x === -1 || y === -1) {
        throw new Error('invalid mnemonic')
      }

      ret[i * 3] = x % 256
      ret[i * 3 + 1] = (x >> 8) + (y % 16) * 16
      ret[i * 3 + 2] = y >> 4
    }

    return ret
  } catch (e) {
    return Promise.reject(e)
  }
}

export function stringToUint8Array(message: string): Uint8Array {
  return new TextEncoder().encode(message)
}

// Merge ArrayBuffers
export function concat(...args: ArrayBuffer[]) {
  let length = 0
  const units = args.map((arg) => {
    return new Uint8Array(arg)
  })

  // Get the total length of all arrays.
  units.forEach((item) => {
    length += item.length
  })

  // Create a new array with total length and merge all source arrays.
  const mergedArray = new Uint8Array(length)
  let offset = 0
  units.forEach((item) => {
    mergedArray.set(item, offset)
    offset += item.length
  })
  // Should print an array with length 90788 (5x 16384 + 8868 your source arrays)
  return mergedArray
}

export enum CONSTANTS {
  PERSISTEDPWDKEY = 'persistedPwd',
  PERSISTEDSEEDKEY = 'persistedSeed',
}
