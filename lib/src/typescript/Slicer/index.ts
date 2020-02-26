import seedrandom from 'seedrandom'

import { seedFor } from './Seed'

import { unpad, START_PADDING_CHARACTER } from '..'

export const MAX_SLICES = 4 // The owner of the data + 3 trustees is optimal as of this version
export const MAX_DELTA = 5
export type Delta = 0 | 1 | 2 | 3 | 4 | 5 
export const MIN_INPUT_SIZE = 8 // Input below 8 characters must be left-padded
export const MIN_SLICE_SIZE = 2

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
  readonly slice: (data: string) => [Slice, ...Array<Slice>]
  /**
   * Unslice the passed slices
   * 
   * @param slices the slices to use
   * @returns the concatenated string
   */
  readonly unslice: (slices: [Slice, ...Array<Slice>]) => string
}

/**
 * @param numberOfSlices Number of parts to splice data into
 * @param deltaMax The maximum difference of size between two slices.
 * It could be generated using `getDeltaMax` or be your specific choice.
 */
export const Slicer = (numberOfSlices: number, deltaMax: Delta): Slicer => ({
  slice: (data: string): [Slice, ...Array<Slice>] => {
    if (data.length === 0)
      throw new Error('unsupported empty data')
    
    const fixedLength = Math.ceil(data.length / numberOfSlices) + deltaMax // >= 1 because of ceil
    const slices = split(numberOfSlices, deltaMax, data).map(split => split.padStart(fixedLength, START_PADDING_CHARACTER))
    return slices as [Slice, ...Array<Slice>]
  },
  unslice: (slices: [Slice, ...Array<Slice>]): string =>
    slices.map(unpad).join('')
})

const split = (numberOfSlices: number, deltaMax: number, data: string): Array<string> =>
  buildSplitMask(numberOfSlices, deltaMax, data.length, seedFor(data))
    .map(mask => data.substring(mask.start, mask.end))

const buildSplitMask = (numberOfSlices: number, deltaMax: number, dataLength: number, seed: string): Array<Mask> => {
  const averageSliceLength = Math.floor(dataLength / numberOfSlices)
  const fullLength = dataLength
  const masks = []

  let catchUp = dataLength - averageSliceLength * numberOfSlices
  let length = 0
  let leftRound = numberOfSlices
  const rng = seedrandom(seed)
  while (dataLength > 0) {
    const randomNum = rng() * Math.round(deltaMax / 2) + Math.floor(catchUp / leftRound)
    let addedNum = Math.min(dataLength, Math.ceil(randomNum) + averageSliceLength)
    // General rounding pb corrected at the end
    if (leftRound == 1 && length + addedNum < fullLength) {
      addedNum += fullLength - length - addedNum
    }
    const m: Mask = {
      start: length,
      end: length + addedNum
    }
    masks.push(m)
    catchUp = fullLength - length - averageSliceLength * leftRound
    leftRound--
    length += addedNum
    dataLength -= addedNum
  }
  return masks
}

/**
 * Find the maximum possible difference of size between two slices.
 * 
 * @param dataLength the length of the source data
 * @param numberOfSlices the wanted number of slices
 * 
 * @returns the maximum gap between the length of slices
 */
export const getDeltaMax = (dataLength: number, numberOfSlices: number): Delta => {
  const sliceSize = Math.floor(dataLength / numberOfSlices)
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
  return deltaMax as Delta
}
