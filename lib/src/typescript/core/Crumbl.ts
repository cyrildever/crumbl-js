import fs from 'fs'

import { Crumb } from '../Encrypter/Crumb'
import { Dispatcher } from '../Encrypter/Dispatcher'
import { encrypt } from '../Encrypter'
import { hash, DEFAULT_HASH_ENGINE } from '../crypto'
import { leftPad } from '../utils/padding'
import { logger, ERROR, SUCCESS } from '../utils/logger'
import { Obfuscator, DEFAULT_KEY_STRING, DEFAULT_ROUNDS } from '../Obfuscator'
import { Signer } from '../models/Signer'
import { Slicer, getDeltaMax, MAX_SLICES, MIN_INPUT_SIZE } from '../Slicer'

export const VERSION = '1' // TODO Change when necessary (change of hash algorithm, modification of string structure, etc.)

export class Crumbl {
  source: string
  hashEngine: string
  owners: Array<Signer>
  trustees: Array<Signer>

  constructor(source: string, hashEngine: string, owners: Array<Signer>, trustees: Array<Signer>) {
    this.source = source
    this.hashEngine = hashEngine
    this.owners = owners
    this.trustees = trustees
  }

  async process(): Promise<string> {
    return await this.doCrumbl()
  }

  async toFile(filename: string): Promise<string> {
    const crumbled = await this.doCrumbl()
    try {
      fs.writeFileSync(filename, crumbled + '\n', 'utf-8')
      logger.log('crumbl successfully saved to ' + filename, SUCCESS)
    } catch (e) {
      logger.log('crumbl could not be saved to ' + filename, ERROR)
    }
    return crumbled
  }

  async toHTML(element: HTMLElement): Promise<string> {
    let crumbled = ''
    crumbled = await this.doCrumbl()
    element.innerText = crumbled
    return crumbled
  }

  private async doCrumbl(): Promise<string> {
    // 1- Obfuscate
    const obfuscator = new Obfuscator(DEFAULT_KEY_STRING, DEFAULT_ROUNDS)
    const obfuscated = obfuscator.apply(this.source)

    // 2- Slice
    const numberOfSlices = 1 + Math.min(this.trustees.length, MAX_SLICES)
    const deltaMax = getDeltaMax(obfuscated.length, numberOfSlices)
    const slicer = new Slicer(numberOfSlices, deltaMax)
    const slices = slicer.apply(leftPad(obfuscated.toString(), MIN_INPUT_SIZE))

    // 3- Encrypt
    const crumbs = new Array<Crumb>()
    for (let i = 0; i < this.owners.length; i++) {
      const crumb = await encrypt(slices[0], 0, this.owners[i])
      crumbs.push(crumb)
    }

    const dispatcher = new Dispatcher(numberOfSlices, this.trustees)
    const allocation = dispatcher.allocate()
    for (let i = 1; i < allocation.size + 1; i++) { // Initial index is 1 in allocation
      const maybeAllocated = allocation.get(i)
      if (maybeAllocated !== undefined) {
        for (let j = 0; j < maybeAllocated.length; j++) {
          const crumb = await encrypt(slices[i], i, maybeAllocated[j])
          crumbs.push(crumb)
        }
      }
    }

    // 4- Hash the source string
    const hSrc = await hash(this.source, DEFAULT_HASH_ENGINE)

    // 5- Finalize the output string
    const stringifiedCrumbs = new Array<string>()
    for (let i = 0; i < crumbs.length; i++) {
      stringifiedCrumbs.push(crumbs[i].toString())
    }
    const crumbled = hSrc + stringifiedCrumbs.join('') + '.' + VERSION

    return crumbled
  }
}
