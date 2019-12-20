import { leftPad, unpad } from '../utils/padding'
import { seedFor } from './Seed'

import seedrandom from 'seedrandom'

export const MAX_SLICES = 4 // The owner of the data + 3 trustees is optimal as of this version
export const MAX_DELTA = 5
export const MIN_INPUT_SIZE = 8 // Input below 8 characters must be left-padded
export const MIN_SLICE_SIZE = 2

export type Slice = string

type mask = {
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
        let splits = this.split(data)
        const fixedLength = Math.floor(data.length / this.numberOfSlices) + this.deltaMax
        let slices = new Array<Slice>()
        splits.forEach(split => {
            const slice = leftPad(split, fixedLength)
            slices.push(slice as Slice)
        })
        if (slices.length != this.numberOfSlices) {
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
        if (slices.length == 0) {
            throw new Error('impossible to use empty slices')
        }
        let splits = new Array<string>()
        slices.forEach(slice => {
            splits.push(unpad(slice))
        })
        const data = splits.join('')
        return data
    }

    private buildSplitMask(dataLength: number, seed: string): Array<mask> {
        let averageSliceLength = Math.floor(dataLength / this.numberOfSlices)
        let minLen = Math.max(averageSliceLength - Math.floor(this.deltaMax / 2), Math.floor(dataLength / (this.numberOfSlices + 1) + 1))
        let maxLen = Math.min(averageSliceLength + Math.floor(this.deltaMax / 2), Math.ceil(dataLength / (this.numberOfSlices - 1) - 1))
        var delta = Math.min(this.deltaMax, maxLen - minLen)
        let masks = new Array<mask>()

        let length = 0
        var rng = seedrandom(seed)
        while (dataLength > 0) {
            let randomNum = Math.floor(rng() * (Math.min(maxLen, dataLength) + 1 - minLen) + minLen)
            let b = Math.floor((dataLength - randomNum) / minLen)
            let r = Math.floor((dataLength - randomNum) % minLen)

            if (r <= b * delta) {
                const m: mask = {
                    start: length,
                    end: length + randomNum
                }
                masks.push(m)
                length += randomNum
                dataLength -= randomNum
            }
        }
        if (masks.length == 0) {
            throw new Error('unable to build split masks')
        }
        return masks

    }

    private split(data: string): Array<string> {
        const masks = this.buildSplitMask(data.length, seedFor(data))
        let splits = new Array<string>()
        masks.forEach(m => {
            splits.push(data.substring(m.start, m.end))
        })
        return splits
    }
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
