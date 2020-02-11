import { Base64, isBase64String } from '../models/Base64'

export class Crumb {
  encrypted: Base64
  index: number
  length: number

  constructor(encrypted: Base64, index: number, length: number) {
    this.encrypted = encrypted
    this.index = index
    this.length = length
  }

  equals(otherCrumb: Crumb): boolean {
    if (this.encrypted.toString() == otherCrumb.encrypted.toString() &&
            this.index == otherCrumb.index &&
            this.length == otherCrumb.length) {
      return true
    }
    return false
  }

  toString(): string {
    return this.index.toString(16).padStart(2, '0') + this.length.toString(16).padStart(4, '0') + this.encrypted.toString()
  }
}

export const toCrumb = (unparsed: string): Crumb => {
  const parsed = parse(unparsed)
  const c = new Crumb(new Base64(parsed[2]), parsed[0], parsed[1])
  return c
}

export const parse = (unparsed: string): [number, number, string] => {
  const idxHex = unparsed.substr(0, 2)
  const idx = parseInt(idxHex, 16)
  const lnHex = unparsed.substr(2, 4)
  const ln = parseInt(lnHex, 16)
  const enc = unparsed.substr(6)
  if (!isBase64String(enc)) {
    throw new Error('not a base64-encoded string: ' + enc)
  }
  if (ln != enc.length) {
    throw new Error('incompatible lengths')
  }
  return [idx, ln, enc]
}
