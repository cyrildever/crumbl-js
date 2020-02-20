import seedrandom from 'seedrandom'

import { seedFor } from './Seed'

import { unpad, START_PADDING_CHARACTER } from '../utils'

export const MAX_SLICES = 4 // The owner of the data + 3 trustees is optimal as of this version
export const MAX_DELTA = 5
export const MIN_INPUT_SIZE = 8 // Input below 8 characters must be left-padded
export const MIN_SLICE_SIZE = 2

export type Slice = string

interface Mask {
  start: number
  end: number
}

export class Slicer {
  numberOfSlices: number
  deltaMax: number

  constructor(numberOfSlices: number, deltaMax: number) {
    this.numberOfSlices = numberOfSlices
    this.deltaMax = deltaMax
  }

  /**
     * Slice the passed data
     * 
     * @param data the data to slice
     * @returns the slices
     */
  apply(data: string): Array<Slice> {
    const fixedLength = Math.floor(data.length / this.numberOfSlices) + this.deltaMax
    const slices = this.split(data).map(split => split.padStart(fixedLength, START_PADDING_CHARACTER))
    if (slices.length !== this.numberOfSlices) {
      throw new Error('wrong number of slices')
    }
    return slices
  }

  /**
     * Unslice the passed slices
     * 
     * @param slices the slices to use
     * @returns the concatenated string
     */
  unapply(slices: Array<Slice>): string {
    if (slices.length === 0) {
      throw new Error('impossible to use empty slices')
    }
    return slices.map(unpad).join('')
  }

  private buildSplitMask(dataLength: number, seed: string): Array<Mask> {
    const averageSliceLength = Math.floor(dataLength / this.numberOfSlices)
    const minLen = Math.max(averageSliceLength - Math.floor(this.deltaMax / 2), Math.floor(dataLength / (this.numberOfSlices + 1) + 1))
    const maxLen = Math.min(averageSliceLength + Math.floor(this.deltaMax / 2), Math.ceil(dataLength / (this.numberOfSlices - 1) - 1))
    const delta = Math.min(this.deltaMax, maxLen - minLen)
    const masks = []

    let length = 0
    const rng = seedrandom(seed)
    while (dataLength > 0) {
      const randomNum = Math.floor(rng() * (Math.min(maxLen, dataLength) + 1 - minLen) + minLen)
      const b = Math.floor((dataLength - randomNum) / minLen)
      const r = Math.floor((dataLength - randomNum) % minLen)

      if (r <= b * delta) {
        const m: Mask = {
          start: length,
          end: length + randomNum
        }
        masks.push(m)
        length += randomNum
        dataLength -= randomNum
      }
    }
    if (masks.length === 0) {
      throw new Error('unable to build split masks')
    }
    return masks

  }

  private split(data: string): Array<string> {
    return this.buildSplitMask(data.length, seedFor(data))
      .map(mask => data.substring(mask.start, mask.end))
}

/**
 * Build the 'deltaMax' value
 * 
 * @param dataLength the length of the source data
 * @param numberOfSlices the wanted number of slices
 * @returns the maximum gap between the length of slices
 */
export const getDeltaMax = (dataLength: number, numberOfSlices: number): number => {
  const sliceSize = dataLength / numberOfSlices
  if (dataLength <= MIN_INPUT_SIZE || sliceSize <= MIN_SLICE_SIZE) {
    return 0
  }
  let deltaMax = 0
  for (let delta = 1; delta < MAX_DELTA + 1; delta++) {
    deltaMax = delta
    if (delta < 2 * (sliceSize - MIN_SLICE_SIZE)) {
      continue
    } else {
      break
    }
  }
  return deltaMax
}
