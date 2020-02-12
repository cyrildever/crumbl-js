export class Base64 {
  encoded: string

  constructor(encoded: string) {
    this.encoded = encoded
  }

  decoded(): Buffer {
    return this.toBytes()
  }

  length(): number {
    return this.encoded.length
  }

  toBytes(): Buffer {
    if (this.encoded === '') {
      return new Buffer(0)
    }
    return Buffer.from(this.encoded, 'base64')
  }

  toString(): string {
    return this.encoded
  }
}

export const toBase64 = (buf: Buffer): Base64 => {
  if (buf.length === 0) {
    return new Base64('')
  }
  return new Base64(buf.toString('base64'))
}

const base64Regex = new RegExp(/[A-Za-z0-9+/=]/)
export const isBase64String = (s: string): boolean => {
  return base64Regex.test(s)
}