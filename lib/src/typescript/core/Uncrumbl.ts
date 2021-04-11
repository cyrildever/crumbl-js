import { FPECipher } from 'feistel-cipher'

import { Collector } from '../Decrypter/Collector'
import { Crumb, toCrumb } from '../Encrypter/Crumb'
import { decrypt } from '../Decrypter'
import { DEFAULT_HASH_LENGTH, DEFAULT_CRYPTO_HASH_ENGINE } from '../crypto'
import { Obfuscator, DEFAULT_HASH_ENGINE, DEFAULT_KEY_STRING, DEFAULT_ROUNDS } from '../Obfuscator'
import { Signer } from '../models/Signer'
import { Uncrumb } from '../Decrypter/Uncrumb'
import { VERSION } from './Crumbl'
import { Hasher } from '../Hasher'
import { unpad } from '..'

export class Uncrumbl {
  crumbled: string
  slices: Array<Uncrumb>
  verificationHash: string
  signer: Signer
  isOwner: boolean

  private cipher: FPECipher

  constructor(crumbled: string, slices: Array<Uncrumb>, verificationHash: string, signer: Signer, isOwner: boolean) {
    this.crumbled = crumbled
    this.slices = slices
    this.verificationHash = verificationHash
    this.signer = signer
    this.isOwner = isOwner
    this.cipher = new FPECipher(DEFAULT_HASH_ENGINE, DEFAULT_KEY_STRING, DEFAULT_ROUNDS)
  }

  async process(): Promise<Buffer> {
    return this.doUncrumbl()
  }

  async toHTML(element: HTMLElement): Promise<Buffer> {
    const uncrumbled = await this.doUncrumbl()
    element.innerText = uncrumbled.toString()
    return uncrumbled
  }

  private async doUncrumbl(): Promise<Buffer> {
    // 1- Parse
    let crumbs = new Array<Crumb>()
    let verificationHash = ''
    try {
      const [vh, crms] = extractData(this.crumbled)
      crumbs = crms
      verificationHash = vh
    } catch (e) {
      return Promise.reject(e)
    }
    if (verificationHash === '' || verificationHash !== this.verificationHash) {
      return Promise.reject(new Error('incompatible input verification hash with crumbl'))
    }

    // 2- Decrypt crumbs
    const uncrumbs = new Map<number, Uncrumb>()
    const indexSet = new Map<number, boolean>()
    for (let i = 0; i < crumbs.length; i++) {
      const idx = crumbs[i].index
      if (!indexSet.has(idx) || indexSet.get(idx)) { // eslint-disable-line @typescript-eslint/strict-boolean-expressions
        indexSet.set(idx, true)
      }
      if (!this.isOwner && idx === 0 || this.isOwner && idx !== 0) {
        continue
      }
      try {
        const uncrumb = await decrypt(crumbs[i], this.signer)
        if (!uncrumbs.has(uncrumb.index)) {
          uncrumbs.set(idx, uncrumb)
        }
      } catch (e) {
        // NO-OP
      }
    }

    // 3- Add passed uncrumbs
    for (let i = 0; i < this.slices.length; i++) {
      if (!uncrumbs.has(this.slices[i].index)) {
        uncrumbs.set(this.slices[i].index, this.slices[i])
      }
    }

    // 4- Determine output
    let hasAllCrumbs = false
    if (indexSet.size === uncrumbs.size) {
      hasAllCrumbs = true
    }
    if (this.isOwner && !hasAllCrumbs) {
      return Promise.reject(new Error('missing crumbs to fully uncrumbl as data owner: only partial uncrumbs are returned'))
    }
    if (hasAllCrumbs) {
      // Owner may recover fully-deciphered data
      const collector = new Collector(uncrumbs, indexSet.size, this.verificationHash, DEFAULT_CRYPTO_HASH_ENGINE)

      // 5a- Deobfuscate
      const obfuscated = collector.toObfuscated()
      const obfuscator = new Obfuscator(this.cipher)
      const deobfuscated = obfuscator.unapply(obfuscated)

      // 5b- Unpad
      const unpadded = unpad(deobfuscated)

      return collector.check(Buffer.from(unpadded))
        .then(isChecked => isChecked ? Promise.resolve(Buffer.from(unpadded)) : Promise.reject(new Error('source has not checked verification hash')))
    } else {
      // Trustee could only return his own uncrumbs

      // 5b- Build partial uncrumbs
      let partialUncrumbs = ''
      for (let i = 0; i < indexSet.size; i++) {
        const maybePartial = uncrumbs.get(i)
        if (maybePartial !== undefined) {
          partialUncrumbs += maybePartial.toString()
        }
      }

      // 6b- Add verification hash prefix and version
      return Buffer.from(this.verificationHash + partialUncrumbs + '.' + VERSION)
    }
  }
}

/**
 * Extract the verification hash and the crumbs from the passed crumbled string
 * 
 * @param {string} crumbl - The full crumbled string
 * @returns the verification hash and the array of crumbs
 */
export const extractData = (crumbled: string): [string, Array<Crumb>] => {
  const parts = crumbled.split('.', 2)
  if (parts[1] !== VERSION) {
    throw new Error('incompatible version: ' + parts[1])
  }

  let crumbsStr = parts[0].substr(DEFAULT_HASH_LENGTH)
  const crumbs = new Array<Crumb>()
  while (crumbsStr.length > 0) {
    const nextLen = parseInt(crumbsStr.substr(2, 4), 16)
    const nextCrumb = crumbsStr.substr(0, nextLen + 6)
    const crumb = toCrumb(nextCrumb)
    crumbs.push(crumb)
    crumbsStr = crumbsStr.substr(nextLen + 6)
  }

  const hasheredSrc = parts[0].substr(0, DEFAULT_HASH_LENGTH)
  const hasher = new Hasher(crumbs)
  const vh = hasher.unapply(hasheredSrc)

  return [vh, crumbs]
}

/**
 * Extract the hashered prefix from the passed crumbled string
 * 
 * @param {string} crumbl - The full crumbled string
 * @returns the hashered prefix
 */
export const getHasheredSrc = (crumbled: string): string => {
  const parts = crumbled.split('.', 2)
  if (parts[1] !== VERSION) {
    throw new Error('incompatible version: ' + parts[1])
  }
  const hasheredSrc = parts[0].substr(0, DEFAULT_HASH_LENGTH)
  if (hasheredSrc.length !== DEFAULT_HASH_LENGTH) {
    throw new Error('invalid hashered prefix' + hasheredSrc)
  }
  return hasheredSrc
}
