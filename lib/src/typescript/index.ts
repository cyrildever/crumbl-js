export * from './client'
export * from './client/Browser/Worker'
export * from './core/Crumbl'
export * from './core/Uncrumbl'
export * from './Decrypter'
export * from './Encrypter'
export * from './Obfuscator'
export * from './Slicer'

export * from './crypto'
export * from './models/Base64'
export * from './models/Signer'

// Unicode U+0002: start of text
export const START_PADDING_CHARACTER = '\u0002'

// Unicode U+0003: end of text
export const END_PADDING_CHARACTER = '\u0003'

export const unpad = (str: string): string => {
  while (str.startsWith(START_PADDING_CHARACTER)) {
    str = str.substr(1)
  }
  while (str.endsWith(END_PADDING_CHARACTER)) {
    str = str.substr(0, str.length - 1)
  }
  return str
}
