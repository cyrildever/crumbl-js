import { Base64, isBase64String } from '../models/Base64'
import { Slice } from '../Slicer/index'

export const PARTIAL_PREFIX = '%'

export class Uncrumb {
  deciphered: Base64
  index: number

  constructor(deciphered: Base64, index: number) {
    this.deciphered = deciphered
    this.index = index
  }

  toSlice(): Slice {
    const s: Slice = this.deciphered.decoded().toString()
    return s
  }

  toString(): string {
    return PARTIAL_PREFIX + this.index.toString(16).padStart(2, '0') + this.deciphered.toString()
  }
}

export const toUncrumb = (unparsed: string): Uncrumb => {
  const [index, deciphered] = parse(unparsed)
  const u = new Uncrumb(new Base64(deciphered), index)
  return u
}

export const parse = (unparsed: string): [number, string] => {
  if (unparsed.startsWith(PARTIAL_PREFIX)) {
    unparsed = unparsed.substr(1)
  }
  const idxHex = unparsed.substr(0, 2)
  const idx = parseInt(idxHex, 16)
  const dec = unparsed.substr(2)
  if (!isBase64String(dec)) {
    throw new Error('not a base64-encoded string: ' + dec)
  }
  return [idx, dec]
}
