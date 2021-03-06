import seedrandom from 'seedrandom'

import { Signer } from '../models/Signer'

export class Dispatcher {
  numberOfSlices: number
  trustees: Array<Signer>

  constructor(numberOfSlices: number, trustees: Array<Signer>) {
    this.numberOfSlices = numberOfSlices
    this.trustees = trustees
  }

  /**
     * Allocate returns a map of slice index -> trustees to sign, or an error if any.
     * It tries to uniformly distribute slices to trustees so that no trustee sign all slices and all slices are at least signed twice if possible.
     * Nota: the first slice (index 0) is reserved for data owners, so it should not be allocated.
     * 
     * @returns a map of arrays of signers by slice index
     */
  allocate(): Map<number, Array<Signer>> {
    const allocation = new Map<number, Array<Signer>>()
    const numberOfTrustees = this.trustees.length
    switch (numberOfTrustees) {
      case 1: {
        // All slices must be signed by the single trustee
        for (let i = 1; i < this.numberOfSlices; i++) {
          allocation.set(i, [this.trustees[0]])
        }
        break
      }
      case 2: {
        // Slices should all be in double but first and last
        for (let i = 1; i < this.numberOfSlices; i++) {
          if (i === 1) {
            allocation.set(i, [this.trustees[0]])
          } else if (i === this.numberOfSlices - 1) {
            allocation.set(i, [this.trustees[1]])
          } else {
            allocation.set(i, [this.trustees[0], this.trustees[1]])
          }
        }
        break
      }
      case 3: {
        // Slices must be allocated to n-1 trustees at most, and no trustee can have it all
        seedrandom(Date.now().toString(), { global: true })
        // TODO Enhance: too naive!
        const combinations = [
          [[1, 2], [1, 3], [2, 3]],
          [[1, 2], [2, 3], [1, 3]],
          [[1, 3], [2, 3], [1, 2]],
          [[1, 3], [1, 2], [2, 3]],
          [[2, 3], [1, 3], [1, 2]],
          [[2, 3], [1, 2], [1, 3]]
        ]
        const chosen = Math.floor(Math.random() * combinations.length)
        for (let i = 0; i < 3; i++) {
          const idx = combinations[chosen][i]
          allocation.set(i + 1, [
            this.trustees[idx[0] - 1],
            this.trustees[idx[1] - 1]
          ])
        }
        break
      }
      default:
        throw new Error('wrong number of trustees')
    }
    return allocation
  }
}