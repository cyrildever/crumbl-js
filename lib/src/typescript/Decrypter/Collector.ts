import { hash } from '../crypto/index'
import { Uncrumb } from './Uncrumb'
import { Padder } from '../Padder'

export class Collector {
  map: Map<number, Uncrumb>
  numberOfSlices: number
  verificationHash: string
  hashEngine: string

  private padder: Padder

  constructor(map: Map<number, Uncrumb>, numberOfSlices: number, verificationHash: string, hashEngine: string) {
    this.map = map
    this.numberOfSlices = numberOfSlices
    this.verificationHash = verificationHash
    this.hashEngine = hashEngine

    this.padder = new Padder()
  }

  /**
     * Test whether the passed data once hashed equals the verification hash
     * 
     * @param data 
     */
  async check(data: Buffer): Promise<boolean> {
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
      o += this.padder.unapply(uncrumb.toSlice())
    }
    o = this.padder.unapply(o)
    return Buffer.from(o)
  }
}