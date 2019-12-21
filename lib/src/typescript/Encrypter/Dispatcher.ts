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
        let allocation = new Map<number, Array<Signer>>()
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
                // Slices should be equally splitted between the two trustees
                for (let i = 1; i < this.numberOfSlices; i++) {
                    allocation.set(i, [this.trustees[i % 2]])
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

    private contains(signers: Array<Signer>, item: Signer): boolean {
        for (let i = 0; i < signers.length; i++) {
            if (signers[i] != null && signers[i].encryptionAlgorithm == item.encryptionAlgorithm &&
                (signers[i].privateKey == null || (signers[i].privateKey != null && signers[i].privateKey!.equals(item.privateKey!))) &&
                (signers[i].publicKey == null || (signers[i].publicKey != null && signers[i].publicKey!.equals(item.publicKey!)))) {
                return true
            }
        }
        return false
    }
}