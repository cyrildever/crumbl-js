import { hash } from '../crypto/index'
import { Uncrumb } from './Uncrumb'
import { unpad } from '../utils'

export class Collector {
  map: Map<number, Uncrumb>
  numberOfSlices: number
  verificationHash: string
  hashEngine: string

  constructor(map: Map<number, Uncrumb>, numberOfSlices: number, verificationHash: string, hashEngine: string) {
    this.map = map
    this.numberOfSlices = numberOfSlices
    this.verificationHash = verificationHash
    this.hashEngine = hashEngine
  }

  /**
     * Test whether the passed data once hashed equals the verification hash
     * 
     * @param data 
     */
  check(data: Buffer): Promise<boolean> {
    return hash(data.toString(), this.hashEngine)
      .then(hashedData => hashedData === this.verificationHash)
  }

  /**
     * @returns the concatenated slices into the obfuscated string
     */
  toObfuscated(): Buffer {
    let o = ''
    for (let i = 0; i < this.numberOfSlices; i++) {
      const uncrumb = this.map.get(i)
      if (uncrumb === undefined) {
        throw new Error(`missing slice with index: ${i}`)
      }
      o += unpad(uncrumb.toSlice())
    }
    return Buffer.from(o)
  }
}