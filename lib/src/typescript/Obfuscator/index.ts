import { hash } from '../crypto'
import { leftPad, unpad } from '../utils/padding'

export const DEFAULT_KEY_STRING = '8ed9dcc1701c064f0fd7ae235f15143f989920e0ee9658bb7882c8d7d5f05692' // hash('crumbl by Edgewhere')
export const DEFAULT_ROUNDS = 10

export class Obfuscator {
    key: string
    rounds: number

    constructor(key: string, rounds: number) {
        this.key = key
        this.rounds = rounds
    }

    /**
     * Obfuscate the passed data
     * 
     * @param data the data to obfuscate
     * @returns the byte array of the obfuscated result
     */
    apply(data: string): Buffer {
        if (data.length % 2 == 1) {
            data = leftPad(data, data.length + 1)
        }
        // Apply the Feistel cipher
        let obfuscated = ''

        let parts = this.split(data)
        for (let i = 0; i < this.rounds; i++) {
            const tmp = this.xor(parts[0], this.round(parts[1], i))
            parts = [parts[1], tmp]
        }
        obfuscated = parts[0] + parts[1]

        return Buffer.from(obfuscated, 'utf-8')
    }

    /**
     * Deobfuscate the passed data
     * 
     * @param obfuscated the byte array to use
     * @returns the deobfuscated string
     */
    unapply(obfuscated: Buffer): string {
        const o = obfuscated.toString('utf-8')
        if (o.length % 2 != 0) {
            throw new Error('invalid obfuscated data')
        }
        // Apply Feistel cipher
        let deobfuscated = ''
        const parts = this.split(o)
        let a = parts[1]
        let b = parts[0]
        for (let i = 0; i < this.rounds; i++) {
            const tmp = this.xor(a, this.round(b, this.rounds - i - 1))
            a = b
            b = tmp
        }
        deobfuscated = b + a

        return unpad(deobfuscated)
    }

    // Feistel implementation

    // Add adds two strings in the sense that each charCode are added
    private add(str1: string, str2: string): string {
        if (str1.length != str2.length) {
            throw new Error('to be added, strings must be of the same length')
        }
        let addedString = ''
        for (let i = 0; i < str1.length; i++) {
            addedString += String.fromCharCode(str1.charCodeAt(i) + str2.charCodeAt(i))
        }
        return addedString
    }

    // Extract returns an extraction of the passed string of the desired length from the passed start index.
    // If the desired length is too long, the key string is repeated.
    private extract(from: string, startIndex: number, desiredLength: number): string {
        startIndex = startIndex % from.length
        const lengthNeeded = startIndex + desiredLength
        return from.repeat(Math.ceil(lengthNeeded / from.length)).substr(startIndex, desiredLength)
    }

    // Round is the function applied at each round of the obfuscation process to the right side of the Feistel cipher
    private round(item: string, index: number): string {
        const addition = this.add(item, this.extract(this.key, index, item.length))
        let hashed = hash(addition)
        return this.extract(hashed, index, item.length)
    }

    // Split splits a string in two equal parts
    private split(str: string): Array<string> {
        if (str.length % 2 != 0) {
            throw new Error('invalid string length: cannot be split')
        }
        const half = str.length / 2
        return [str.substr(0, half), str.substr(half)]
    }

    // Xor function XOR two strings in the sense that each charCode are xored
    private xor(str1: string, str2: string): string {
        var xored = ''
        for (let i = 0; i < str1.length; i++) {
            xored += String.fromCharCode(str1.charCodeAt(i) ^ str2.charCodeAt(i))
        }
        return xored
    }
}
