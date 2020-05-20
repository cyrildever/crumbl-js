import * as feistel from 'feistel-cipher'

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
  unapply(obfuscated: Buffer): string {
    return this.cipher.decrypt(obfuscated)
  }
}
