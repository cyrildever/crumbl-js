export const string2Buffer = (str: string, encoding: 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex' | undefined): Buffer => {
  return Buffer.from(str, encoding)
}