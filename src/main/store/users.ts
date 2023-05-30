import Datastore from 'nedb'
import { promisify } from 'node:util'
import { join } from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import sha256 from 'sha256'
import aesjs from 'aes-js'
import md5 from 'md5'
import base32Encode from 'base32-encode'
import base32Decode from 'base32-decode'
import * as ed from '@noble/ed25519'
import crc32c from 'crc-32/crc32c'
import { UserDoc } from '../../model/user'
import BaseStore from './base'
import { concat, encodeMnemonic, stringToUint8Array } from '../utils'
import { base64 } from 'ethers/lib/utils'
import crypto from 'node:crypto'
import msgStore from './messages'

class UserStore extends BaseStore {
  store: Datastore
  // Random Seed
  private seed: Uint8Array | null
  private salt = 1
  address: string

  constructor() {
    super()

    this.store = new Datastore({
      autoload: true,
      filename: join(this.savePath, 'users'),
    })
    
  }

  async lock (isLock = true) {
    const update = promisify<object, object, any>(
      this.store.update.bind(this.store)
    )
    const result = await update({ address: this.address }, { $set: { isLock } })
    return result
  }

  async validatePwd (pwd: string) {
    const find = promisify<object, UserDoc[]>(
      this.store.find.bind(this.store)
    )
    
    const users = await find({})
    const valid = users.length ? users[0].pwd === md5(pwd) : false
    if (valid) {
      this.lock(false)
    }
    
    return valid 
  }

  async getUser (seed?: Uint8Array): Promise<UserDoc | null> {
    const find = promisify<object, UserDoc[]>(
      this.store.find.bind(this.store)
    )
    const users = await find({})
    const user = users.length ? users[0] : null
    if (user) {
      this.address = user.address
    }
    return user
  }

  async reset () {
    const remove = promisify<object, any>(
      this.store.remove.bind(this.store)
    )
    const user = await this.getUser()
    msgStore.removeConversationMessages(user.address)
    const result = await remove({})
    return !!result
  }

  /**
   * @description salt int
   * @param salt string
   * @returns Uint8Array
   */
  public formatedSalt(salt: number): Uint8Array {
    // try {
    const formatedSalt = sha256(`${salt}`, { asBytes: true })
    return new Uint8Array(formatedSalt)
    // } catch (error) {
    //   console.error('Exception ' + error)
    // }
  }

  /**
   *
   * @description address = base32(32byte publickey + 4byte crc) crc last bit set id, ed25519 = 3
   * @description publickey = privatekey(sha256(seed + sha256(salt)))
   * @param salt string
   * @param alias string
   * @returns string
   */
  public async generateNewAddress(): Promise<boolean | string | undefined | any> {
    try {
      const salt = this.formatedSalt(this.salt)
      if (!salt) throw new Error('Invalid salt received')
      if (!this.seed) throw new Error('Invalid seed')
      const formatedSeed = concat(this.seed, salt)
      const privateKeyStr = sha256(formatedSeed as Buffer, { asBytes: true })
      const keyPair = await this.generatePairOfKey(salt)
      const publicKey = keyPair[0]
      if (!keyPair) throw new Error('Invalid key received')
      // console.log(keyPair)
      let errorCorrectingCode = crc32c.buf(publicKey, 3)
      errorCorrectingCode = (errorCorrectingCode & 0xfffffff0) | 0x3
      errorCorrectingCode = errorCorrectingCode >>> 0
      const buffer = new Int32Array([errorCorrectingCode]).buffer
      const errorCorrectingCodeBuffer = new Uint8Array(buffer)
      const mergedBuffer = concat(publicKey, errorCorrectingCodeBuffer)

      this.salt += 1
      // background set popup uint8array to be object
      return base32Encode(mergedBuffer, 'Crockford')
    } catch (error: any) {
      // console.error('Exception ' + error)
      return `${error}`
    }
  }

  public async generatePairOfKey(
    salt: Uint8Array
  ): Promise<[Uint8Array, Uint8Array] | undefined> {
    try {
      // sk = sha256(seed + sha256(salt))
      const privateKey = await this.generateSecretKey(salt)
      // console.log('privateKey', privateKey)
      const publicKey = await this.generatePublicKey(privateKey)

      if (!privateKey || !publicKey) {
        return undefined
      }

      return [publicKey, privateKey]
    } catch (error) {
      console.error('Exception ' + error)
    }
  }

  /**
   * @description private key
   */
  private generateSecretKey(salt: Uint8Array): Uint8Array | undefined {
    try {
      if (!this.seed) throw new Error('Invalid seed')
      const formatedSeed = concat(this.seed, salt)
      const privateKeyStr = sha256(formatedSeed as Buffer, { asBytes: true })
      return new Uint8Array(privateKeyStr)
    } catch (error) {
      console.error('Exception ' + error)
    }
  }

  /**
   * @description public key
   * @param privateKey: uint8array
   * @returns T
   */
  public generatePublicKey(
    privateKey: Uint8Array | undefined
  ): Promise<Uint8Array | undefined> {
    try {
      if (!privateKey) {
        throw new Error('lost private key')
      }
      return ed.getPublicKey(privateKey)
    } catch (error) {
      console.error('Exception ' + error)
    }
  }

  /**
   * @description first login:
   * 1. genertate 64bytes RandomSeed
   * 2. md5(pwd) save
   * 3. md5(sh256(pwd)) = seed, RandomSeed aes save
   */
  public async generateUser(pwd: string): Promise<string> {
    try {
      const presistedPwd = md5(pwd)
      const tableContainer = new Uint8Array(28)
      const randomData = crypto.getRandomValues(tableContainer)
      this.seed = new Uint8Array(randomData)
      const seed = await this.persistEncryptedSeed(pwd)
      console.log(seed)
      const encryptedSeed = base64.encode(seed)
      console.log(encryptedSeed, 'encryptedSeed')
      const words = await this.generateSeed(seed as any)
      const encodeAddress = await this.generateNewAddress()
      this.store.insert({ seed: encryptedSeed, pwd: presistedPwd, address: encodeAddress, words, isLock: false })
      return encodeAddress
    } catch (error) {
      console.error('Exception ' + error)
      return ''
    }
  }

  /**
   * @description save seed
   * @param pwd string
   */
  public async persistEncryptedSeed(pwd: string) {
    try {
      const secretKey = sha256(pwd)
      const secretKey16Bytes = md5(secretKey)
      const secretKey16BytesBuffer = stringToUint8Array(secretKey16Bytes)
      const aesCtr = new aesjs.ModeOfOperation.ctr(
        secretKey16BytesBuffer,
        new aesjs.Counter(1)
      )

      if (!this.seed) throw new Error('Invalid seed')
      const encryptedBytes = aesCtr.encrypt(this.seed)
      return encryptedBytes
    } catch (error) {
      console.error('Exception ' + error)
    }
  }

  /**
   * @description random seed
   */
  private async generateSeed(seed?: number[]) {
    try {
      let seedU8: number[] | Uint8Array = []
      if (!seed) {
        const tableContainer = new Uint8Array(27)
        const randomData = crypto.getRandomValues(tableContainer)
        seedU8 = randomData // sha256(randomData as Buffer, { asBytes: true })
      } else {
        seedU8 = seed
      }
      console.log('seedU8 ===>', seedU8)
      this.seed = new Uint8Array(seedU8)
      const words = await encodeMnemonic(this.seed)
      console.log('mnemonic', words)
      return words
    } catch (error) {
      console.error('Exception ' + error)
    }
  }

  /**
   * @description decode seed
   */
  private async decryptSeed(pwd: string) {
    try {
      const secretKey = sha256(pwd)
      const secretKey16Bytes = md5(secretKey)
      const secretKey16BytesBuffer = stringToUint8Array(secretKey16Bytes)

      const aesCtr = new aesjs.ModeOfOperation.ctr(
        secretKey16BytesBuffer,
        new aesjs.Counter(1)
      )
      const find = promisify<object, UserDoc[]>(
        this.store.find.bind(this.store)
      )
      const [{ seed }] = await find({})
      const encryptedSeed = base64.decode(seed)
      this.seed = aesCtr.decrypt(new Uint8Array(encryptedSeed))
    } catch (error) {
      console.error('Exception ' + error)
    }
  }
}

export default new UserStore()
