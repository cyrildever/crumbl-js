import { hash } from '../crypto/index'
import { Uncrumb } from './Uncrumb'
import { unpad } from '../utils/padding'

export class Collector {
    map: Map<number, Uncrumb>
    numberOfSlices: number
    verificationHash: string
    hashEngine: string

    constructor(map: Map<number, Uncrumb>, numberOfSlices: number, verificationHash: string, hashEngine: string) {
        this.map = map
        this.numberOfSlices = numberOfSlices
        this.verificationHash = verificationHash
        this.hashEngine = hashEngine
    }

    /**
     * Test whether the passed data once hashed equals the verification hash
     * 
     * @param data 
     */
    check(data: Buffer): boolean {
        let hashedData = ''
        try {
            hashedData = hash(data.toString(), this.hashEngine)
        } catch (e) {
            return false
        }
        return hashedData == this.verificationHash
    }

    /**
     * @returns the concatenated slices into the obfuscated string
     */
    toObfuscated(): Buffer {
        let o = ''
        for (let i = 0; i < this.numberOfSlices; i++) {
            if (!this.map.get(i)) {
                throw new Error('missing slice with index: ' + i)
            }
            const uncrumb = this.map.get(i)!
            o += unpad(uncrumb.toSlice())
        }
        return Buffer.from(o)
    }
}