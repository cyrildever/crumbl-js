import { FPECipher } from 'feistel-cipher'

import { seedFor } from '../../../../lib/src/typescript/Slicer/Seed'
import { Slicer, getDeltaMax } from '../../../../lib/src/typescript/Slicer'
import { DEFAULT_HASH_ENGINE, DEFAULT_KEY_STRING, DEFAULT_ROUNDS, Obfuscator } from '../../../../lib/src/typescript'

declare function expect(val: any, message?: string): any

describe('Slicer', () => {
  // Equivalent to 'crumbl-exe/slicer/slicer_test.go' tests
  describe('slice', () => {
    it('should have numberOfSlices as length', () => {
      const numberOfSlices = 4
      const slicer = Slicer(numberOfSlices, 0)
      const slices = slicer.slice('11111222223333344444')
      slices.length.should.eqls(numberOfSlices)
    })
    it('should fail if numberOfSlices === 0', () => {
      const numberOfSlices = 0
      expect(() => Slicer(numberOfSlices, 0)).to.throw('number of slices too small: 0')
    })
    it('should fail if numberOfSlices < 0', () => {
      const numberOfSlices = -3
      expect(() => Slicer(numberOfSlices, 0)).to.throw('number of slices too small: -3')
    })
    it('should be deterministic for delta max = 0', () => {
      const slicer = Slicer(4, 0)
      const slices1 = slicer.slice('11111222223333344444')
      const slices2 = slicer.slice('11111222223333344444')
      slices1.should.eqls(slices2) // ['11111', '22222', '33333', '44444']
    })
    it('should be deterministic for a small delta max', () => {
      const slicer = Slicer(4, 2)
      const slices1 = slicer.slice('111111111222222222333333333444444444')
      const slices2 = slicer.slice('111111111222222222333333333444444444')
      slices1.should.eqls(slices2)
    })
    it('should produce slices of the same size', () => {
      const slicer = Slicer(4, 2)
      const slices = slicer.slice('111111111222222222333333333444444444')
      const size = slices[0].length
      slices.every(slice => slice.length === size).should.be.true
    })
    it('should work under heavy load', () => {
      expect(() => {
        for (let i = 0; i < 10000; i++) {
          const data = randomString()
          const slicer = Slicer(10, getDeltaMax(data.length, 10))
          slicer.slice(data)
        }
      }).to.not.throw()
    })
    it('should behave the same as the Go implementation', () => {
      const slicer = Slicer(4, 2)
      const slices = slicer.slice('111111111222222222333333333444444444')

      slices[3].should.eqls('\u0002\u0002\u0002\u0002\u000244444444') // Different from Go implementation due to random generator
    })
    it('should have expected behaviour', () => {
      const ref = 'cdever@edgewhere.fr'
      const numberOfSlices = 4
      const obfuscator = new Obfuscator(new FPECipher(DEFAULT_HASH_ENGINE, DEFAULT_KEY_STRING, DEFAULT_ROUNDS))
      const found = obfuscator.apply(ref)
      const slicer = Slicer(numberOfSlices, getDeltaMax(ref.length, numberOfSlices))
      const slices = slicer.slice(found.toString())
      const size = slices[0].length
      slices.should.have.lengthOf(numberOfSlices)
      slices.every(s => s.length == size).should.be.true
    })
  })
  describe('unslice', () => {
    it('should be deterministic', () => {
      const slicer = Slicer(4, 0)
      const found1 = slicer.unslice(['\u0002\u000211111', '\u0002\u000222222', '\u0002\u000233333', '\u0002\u000244444'])
      const found2 = slicer.unslice(['\u0002\u000211111', '\u0002\u000222222', '\u0002\u000233333', '\u0002\u000244444'])

      found1.should.eqls(found2) // '11111222223333344444'
    })
  })
  describe('getDeltaMax', () => {
    it('should be determinisitic', () => {
      const found1 = getDeltaMax(25, 4)
      const found2 = getDeltaMax(25, 4)
      expect(found1).to.eqls(found2)
    })
    it('should return 0 if dataLength <= 8 ', () => {
      const found = getDeltaMax(5, 1)
      expect(found).to.eqls(0)
    })
    it('should return 0 if dataLength / numberOfSlices === 2', () => {
      const found = getDeltaMax(5, 10)
      expect(found).to.eqls(0)
    })
    it('should return 0 if dataLength / numberOfSlices < 2', () => {
      const found = getDeltaMax(5, 5)
      expect(found).to.eqls(0)
    })
    it('should return 0 if dataLength / numberOfSlices === 2 (round down)', () => {
      const found = getDeltaMax(5, 11)
      expect(found).to.eqls(0)
    })
    it('should fail if numberOfSlices <= 0', () => {
      expect(() => getDeltaMax(5, 0)).to.throw('number of slices too small: 0')
    })
    it('should return 5 for big numbers', () => {
      const found = getDeltaMax(50000, 1100)
      expect(found).to.eqls(5)
    })
  })
  describe('seedFor', () => {
    it('should be deterministic', () => {
      const data1 = 'ab'
      const expected = '195'
      const found = seedFor(data1)

      found.should.eqls(expected)
    })
    it('should contains the sum of char codes', () => {
      const data = randomString()
      const found = seedFor(data)
      const sum = Array.from(data).reduce((sum, char) => sum + char.charCodeAt(0), 0)
      expect(parseInt(found)).to.eqls(sum)
    })
    it('should be 0 for empty string', () => {
      const data = ''
      const found = seedFor(data)
      const sum = 0
      expect(parseInt(found)).to.eqls(sum)
    })
  })
  describe('slice/unslice', () => {
    it('should be invariant', () => {
      const data = randomString()
      const slicer = Slicer(10, getDeltaMax(data.length, 10))
      const found = slicer.unslice(slicer.slice(data))

      found.should.eqls(data)
    })
  })
})

const randomString = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)