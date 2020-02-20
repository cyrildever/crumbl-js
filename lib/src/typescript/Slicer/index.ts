import seedrandom from 'seedrandom'

import { seedFor } from './Seed'

import { unpad, START_PADDING_CHARACTER } from '..'

export const MAX_SLICES = 4 // The owner of the data + 3 trustees is optimal as of this version
const MAX_DELTA = 5
export const MIN_INPUT_SIZE = 8 // Input below 8 characters must be left-padded
const MIN_SLICE_SIZE = 2

export type Slice = string

interface Mask {
  start: number
  end: number
}

//TODO a nicer syntax wouls be slice(data).into(numberOfSlices) and unslice(slices) or just slice(data, numberOfSlices)
interface Slicer {
  /**
   * Slice the passed data into an array of multiple parts.
   * The number of part is base on the properties `numberOfSlices` and `dataLength` this object was
   * initialized with.
   * 
   * @param data the data to slice. It must be of the right length.
   * @returns Slices of the data, an array containing `numberOfSlices` element.
   * 
   * @throws 'wrong number of slices' if we cannot build an array for this data. Most likely this Slicer isn't meant for this data.
   */
  readonly slice: (data: string) => Array<Slice>
  /**
   * Unslice the passed slices
   * 
   * @param slices the slices to use
   * @returns the concatenated string
   */
  readonly unslice: (slices: [Slice, ...Array<Slice>]) => string
}

export const Slicer = (numberOfSlices: number, dataLength: number): Slicer => ({
  slice: (data: string): Array<Slice> => {
    const deltaMax = getDeltaMax(dataLength, numberOfSlices)
    const fixedLength = Math.floor(data.length / numberOfSlices) + deltaMax
    const slices = split(numberOfSlices, deltaMax, data).map(split => split.padStart(fixedLength, START_PADDING_CHARACTER))
    if (slices.length !== numberOfSlices) {
      throw new Error('wrong number of slices')
    }
    return slices
  },
  unslice: (slices: [Slice, ...Array<Slice>]): string =>
    slices.map(unpad).join('')
})

const split = (numberOfSlices: number, deltaMax: number, data: string): Array<string> =>
  buildSplitMask(numberOfSlices, deltaMax, data.length, seedFor(data))
    .map(mask => data.substring(mask.start, mask.end))

//TODO we could initiazlied the masks array with an array of numberOfSlices element, which would grant a garantuee about the number of elements
const buildSplitMask = (numberOfSlices: number, deltaMax: number, dataLength: number, seed: string): Array<Mask> => {
  const averageSliceLength = Math.floor(dataLength / numberOfSlices)
  const minLen = Math.max(averageSliceLength - Math.floor(deltaMax / 2), Math.floor(dataLength / (numberOfSlices + 1) + 1))
  const maxLen = Math.min(averageSliceLength + Math.floor(deltaMax / 2), Math.ceil(dataLength / (numberOfSlices - 1) - 1))
  const delta = Math.min(deltaMax, maxLen - minLen)
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
  return masks

}

/**
 * Build the 'deltaMax' value
 * 
 * @param dataLength the length of the source data
 * @param numberOfSlices the wanted number of slices
 * @returns the maximum gap between the length of slices
 */
const getDeltaMax = (dataLength: number, numberOfSlices: number): number => {
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
