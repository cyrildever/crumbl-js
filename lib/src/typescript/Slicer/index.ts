import seedrandom = require('seedrandom')

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
    const fixedLength = Math.floor(data.length / numberOfSlices) + deltaMax
    const slices = split(numberOfSlices, deltaMax, data).map(split => split.padStart(fixedLength, START_PADDING_CHARACTER))
    return slices as [Slice, ...Array<Slice>]
  },
  unslice: (slices: [Slice, ...Array<Slice>]): string =>
    slices.map(unpad).join('')
})

const split = (numberOfSlices: number, deltaMax: Delta, data: string): Array<string> => {
  
  if(numberOfSlices >= data.length)
    throw new Error(`Cannot split a string of length ${data.length} into ${numberOfSlices} chunks`)

  const variance = Math.floor(deltaMax / 2) // variance >= 0
  const seed = seedFor(data)
  const rng = seedrandom(seed)

  const averageSliceLength = Math.floor(data.length / numberOfSlices) // averageSliceLength >= 1
  // minLen >= 0, we want >= 1, therefore the condition
  const minLen = averageSliceLength > variance ? averageSliceLength - variance : 1 // eslint-disable-line @typescript-eslint/strict-boolean-expressions
  const maxLen = averageSliceLength + variance

  const numberOfRemainingChars = data.length - numberOfSlices * averageSliceLength
  if(numberOfRemainingChars > deltaMax * numberOfSlices)
    throw new Error(`Cannot split a string of length ${data.length} into ${numberOfSlices} chunks with each chunks being able to hold ${maxLen} chars`)

  // each string is averageSliceLength long, last one may be smaller
  const slices = data.match(new RegExp(`.{1,${averageSliceLength}}`, 'g')) as Array<string> // eslint-disable-line

  let moves = 0
  // evenlySplit.length === numberOfSlices
  for(let i = 0; i < numberOfSlices - 1; i++) { // last one is handle differently
    const move = Math.round(rng() * variance * 2 - variance) // move:  variance >= end >= - variance
    moves += move
    if(move < 0) {
      const piece = takeRight(slices[i])(Math.abs(move))
      slices[i + 1] = piece + slices[i + 1] // +1 is safe because we do not access last one
      slices[i] = takeLeft(slices[i])(slices[i].length - Math.abs(move))
    } else if(move > 0) {
      const piece = takeLeft(slices[i + 1])(move)
      slices[i + 1] = slices[i + 1].substring(move)
      slices[i] = slices[i] + piece
    } else { // move === 0
      continue
    }
  }

  //handle last piece, moves could be positive or negative, only one while will take action
  while(moves > deltaMax) { //if moves is positive, it means the last slice will contains not enought chars
    const peakedIndex = Math.round(rng() * numberOfSlices) // 0 <= peakedIndex <= numberOfSlices
    if(slices[peakedIndex].length > minLen) {
      //If the random index contains more than needed chars, we move one up to the last slice
      for(let i = peakedIndex; i <= numberOfSlices; i++) {
        const piece = slices[i].charAt(slices[i].length - 1)
        console.log('piece', piece)
        slices[i] = takeLeft(slices[i])(slices[i].length - 1)
        slices[i + 1] = piece + slices[i + 1]
      }
      moves--
    }
  }
  while(moves < -deltaMax) {  //if moves is negative, it means the last slice will contains too much chars
    const peakedIndex = Math.round(rng() * numberOfSlices) // 0 <= peakedIndex <= numberOfSlices
    if(slices[peakedIndex].length < maxLen) {
      //If the random index contains less than maximum chars, we move one down from the last slice
      for(let i = numberOfSlices; i >= peakedIndex; i--) {
        const piece = slices[i].charAt(0)
        slices[i] = takeRight(slices[i])(slices[i].length - 1)
        slices[i - 1] = slices[i - 1] + piece
      }
      moves++
    }
  }
  return slices
}

const takeLeft = (str: string) => (n: number): string =>
  str.substring(0, n)
const takeRight = (str: string) => (n: number): string =>
  str.substring(str.length - n, str.length + 1)

/**
 * Find the maximum possible difference of size between two slices.
 * 
 * @param dataLength the length of the source data
 * @param numberOfSlices the wanted number of slices
 * 
 * @returns the maximum gap between the length of slices
 */
export const getDeltaMax = (dataLength: number, numberOfSlices: number): Delta => {
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
  return deltaMax as Delta
}
