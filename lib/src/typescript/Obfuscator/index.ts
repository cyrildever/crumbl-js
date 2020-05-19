import * as feistel from 'feistel-cipher'

import { START_PADDING_CHARACTER } from '..'
import { hash, DEFAULT_HASH_ENGINE } from '../crypto'

export const DEFAULT_KEY_STRING = '8ed9dcc1701c064f0fd7ae235f15143f989920e0ee9658bb7882c8d7d5f05692' // hash('crumbl by Edgewhere')
export const DEFAULT_ROUNDS = 10

export class Obfuscator {
  readonly cipher: feistel.Cipher

  constructor(key: string, rounds: number) {
    this.cipher = new feistel.Cipher(key, rounds)
  }

  /**
   * Obfuscate the passed data
   * 
   * @param {string} data - the data to obfuscate
   * @returns the byte array of the obfuscated result
   */
  apply(data: string): Buffer {
    return this.cipher.encrypt(data)
  }

  /**
   * Deobfuscate the passed data
   * 
   * @param {Buffer} obfuscated - the byte array to use
   * @returns the deobfuscated string
   */
  async unapply(obfuscated: Buffer, verificationHash: string): Promise<string> {
    if (obfuscated.length % 2 !== 0) {
      for (let i = 0; i < obfuscated.length; i++) {
        const begin = obfuscated.toString().substring(0, i)
        const end = obfuscated.toString().substring(i)
        const attempt = this.cipher.decrypt(Buffer.from(begin + START_PADDING_CHARACTER + end))
        const found = await hash(attempt, DEFAULT_HASH_ENGINE).then(vh => vh === verificationHash)
        if (found) {
          return attempt
        }
      }
      return ''
    }
    return this.cipher.decrypt(obfuscated)
  }
}
