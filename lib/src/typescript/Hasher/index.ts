import xor from 'buffer-xor'

import { Crumb } from '../Encrypter/Crumb'
import { hash, DEFAULT_HASH_ENGINE } from '../crypto'
import { euclideanDivision } from '..'

export const NUMBER_OF_CHARACTERS = 32

/**
 * Hasher generate a modified hash unique to a source and its signers, or recover the hash of the original data.
 * When applying it, it should prepend the crumbs to finalize the Crumbl.
 * Algorithm: N-32 last chars of the hex string of the hashed source + (32 last chars ^ padded/cut lexicographically sorted owners encrypted crumbs).toHex
 */
export class Hasher {
  readonly crumbs: ReadonlyArray<Crumb>

  constructor(crumbs: ReadonlyArray<Crumb>) {
    this.crumbs = crumbs
  }

  /**
   * Build the hashered prefix for the Crumbl
   * 
   * @param {string} source - the data source
   * @returns the hashered string
   */
  async apply(source: string): Promise<string> {
    const stringifiedHash = await hash(source, DEFAULT_HASH_ENGINE)
    const length = stringifiedHash.length
    if (length < NUMBER_OF_CHARACTERS) {
      const msg = 'wrong hash algorithm'
      throw new Error(msg)
    }
    const lastBytes = Buffer.from(stringifiedHash.substring(length - NUMBER_OF_CHARACTERS), 'hex')
    const sortedOwnerCrumbs = this.crumbs.filter(crumb => crumb.index === 0).map(_ => _.encrypted.toString()).sort() // eslint-disable-line @typescript-eslint/require-array-sort-compare
    if (sortedOwnerCrumbs.length < 1) {
      throw new Error('owner\'s crumbs not present')
    }
    const concat = Buffer.from(sortedOwnerCrumbs.join(''), 'base64')
    const mask = buildMask(concat, NUMBER_OF_CHARACTERS / 2)
    const xored = xor(lastBytes, mask)
    const xoredHex = xored.toString('hex')
    return stringifiedHash.substring(0, length - NUMBER_OF_CHARACTERS) + xoredHex
  }

  /**
   * Recover the original hash
   * 
   * @param {string} hashered - the hashered string
   * @returns the original hexadecimal representation of the hash of the source data
   */
  unapply(hashered: string): string {
    if (hashered.length < NUMBER_OF_CHARACTERS) {
      throw new Error('wrong hashered value')
    }
    const xoredHex = hashered.substring(hashered.length - NUMBER_OF_CHARACTERS)
    const xored = Buffer.from(xoredHex, 'hex')
    const sortedOwnerCrumbs = this.crumbs.filter(crumb => crumb.index === 0).map(_ => _.encrypted.toString()).sort() // eslint-disable-line @typescript-eslint/require-array-sort-compare
    if (sortedOwnerCrumbs.length < 1) {
      throw new Error('owner\'s crumbs not present')
    }
    const concat = Buffer.from(sortedOwnerCrumbs.join(''), 'base64')
    const mask = buildMask(concat, NUMBER_OF_CHARACTERS / 2)
    const lastBytes = xor(xored, mask)
    return hashered.substring(0, hashered.length - NUMBER_OF_CHARACTERS) + lastBytes.toString('hex')
  }
}

const buildMask = (key: Buffer, length: number): Buffer => {
  let mask = Buffer.alloc(0)
  if (key.length === 0) {
    return mask
  }
  if (key.length >= length) {
    return key.slice(0, length)
  }
  const [quotient, remainder] = euclideanDivision(length, key.length)
  for (let i = 0; i < quotient; i++) {
    mask = Buffer.concat([mask, key])
  }
  return Buffer.concat([mask, key.slice(0, remainder)])
}
