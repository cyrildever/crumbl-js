import { Padder, PREPEND_SIZE, ALTERNATE_PADDING_CHARACTER_1, ALTERNATE_PADDING_CHARACTER_2 } from '../../../../lib/src/typescript/Padder'

declare function expect(val: any, message?: string): any

const padder = new Padder()

// Equivalent to crumbl-exe/padder/padder_test.go
describe('Padder', () => {
  describe('apply', () => {
    it('should be deterministic', () => {
      const maxSliceLength = 3

      const slice1 = new Buffer([3, 4, 5])
      const found1 =  padder.apply(slice1.toString(), maxSliceLength, false)
      const expected1 = new Buffer([2, 2, 3, 4, 5])
      found1.should.have.lengthOf(maxSliceLength + PREPEND_SIZE)
      Buffer.from(found1).should.eqls(expected1)

      const	slice2 = new Buffer([6, 7])
      const found2 = padder.apply(slice2.toString(), maxSliceLength, false)
      const expected2 = new Buffer([2, 2, 2, 6, 7])
      Buffer.from(found2).should.eqls(expected2)

      const slice3 = new Buffer([2, 3])
      const found3 = padder.apply(slice3.toString(), maxSliceLength, false)
      const expected3 = new Buffer([Buffer.from(ALTERNATE_PADDING_CHARACTER_1)[0], Buffer.from(ALTERNATE_PADDING_CHARACTER_1)[0],Buffer.from(ALTERNATE_PADDING_CHARACTER_1)[0], 2, 3])
      Buffer.from(found3).should.eqls(expected3)

      const slice4 = new Buffer([2, 4])
      const found4 = padder.apply(slice4.toString(), maxSliceLength, false)
      const expected4 = new Buffer([Buffer.from(ALTERNATE_PADDING_CHARACTER_2)[0], Buffer.from(ALTERNATE_PADDING_CHARACTER_2)[0], Buffer.from(ALTERNATE_PADDING_CHARACTER_2)[0], 2, 4])
      Buffer.from(found4).should.eqls(expected4)

      let expected = new Buffer([2, 1, 1, 1])
      const slice5 = new Buffer([1, 1, 1])
      const found5 = padder.apply(slice5.toString(), slice5.length, true)
      found5.should.have.lengthOf(4)
      Buffer.from(found5).should.eqls(expected)

      const wrongSlice = Buffer.alloc(0)
      expect(() => padder.apply(wrongSlice.toString(), maxSliceLength, false)).to.throw('empty slice')

      const wrongLength = 0
      expect(() => padder.apply(slice1.toString(), wrongLength, false)).to.throw('max slice length too short')

      const alreadyEvenData = new Buffer([2, 2])
      let found = padder.apply(alreadyEvenData.toString(), alreadyEvenData.length, true)
      Buffer.from(found).should.eqls(alreadyEvenData)

      const alreadyEvenButTooShort = new Buffer([4, 4])
      const wishedLength = 4
      found = padder.apply(alreadyEvenButTooShort.toString(), wishedLength, true)
      expected = new Buffer([2, 2, 4, 4])
      Buffer.from(found).should.eqls(expected)
      found.should.have.lengthOf(wishedLength)

      expect(() => padder.apply(slice1.toString(), 5, true)).to.throw('wished length is not even')
    })
  })
  describe('unapply', () => {
    it('should return appropriate results', () => {
      const padded1 = new Buffer([2, 2, 3, 4, 5])
      const found1 = padder.unapply(padded1.toString())
      const expected1 = new Buffer([3, 4, 5])
      Buffer.from(found1).should.eqls(expected1)

      const padded2 = new Buffer([2, 2, 2])
      expect(() => padder.unapply(padded2.toString())).to.throw('invalid padded data: all pad chars')

      const padded3 = new Buffer([5, 5, 5, 2, 4])
      const found3 = padder.unapply(padded3.toString())
      const expected3 = new Buffer([2, 4])
      Buffer.from(found3).should.eqls(expected3)

      const evenData = new Buffer([127, 127])
      const found4 = padder.unapply(evenData.toString())
      Buffer.from(found4).should.eqls(evenData)

      const evenZero = new Buffer([0, 0])
      const found5 = padder.unapply(evenZero.toString())
      Buffer.from(found5).should.eqls(evenZero)

      const wrongPadded = new Buffer([127, 126, 125])
      expect(() => padder.unapply(wrongPadded.toString())).to.throw('invalid padded data: wrong padding')
    })
  })
})
