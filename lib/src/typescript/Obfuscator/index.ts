import { FPECipher, readable2Buffer, SHA_256, toBase256Readable } from 'feistel-cipher'

export const DEFAULT_HASH_ENGINE = SHA_256
export const DEFAULT_KEY_STRING = '8ed9dcc1701c064f0fd7ae235f15143f989920e0ee9658bb7882c8d7d5f05692' // hash('crumbl by Edgewhere')
export const DEFAULT_ROUNDS = 10

export class Obfuscator {
  readonly cipher: FPECipher

  constructor(cipher: FPECipher) {
    this.cipher = cipher
  }

  /**
   * Obfuscate the passed data
   * 
   * @param {string} data - the data to obfuscate
   * @returns the byte array of the obfuscated result
   */
  apply(data: string): Buffer {
    return readable2Buffer(this.cipher.encrypt(data))
  }

  /**
   * Deobfuscate the passed data
   * 
   * @param {Buffer} obfuscated - the byte array to use
   * @returns the deobfuscated string
   */
  unapply(obfuscated: Buffer): string {
    return this.cipher.decrypt(toBase256Readable(obfuscated))
  }
}
