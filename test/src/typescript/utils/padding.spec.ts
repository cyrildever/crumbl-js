import { leftPad, rightPad, unpad, LEFT_PADDING_CHARACTER } from '../../../../lib/src/typescript/utils/padding'

describe('utils/padding', () => {
  // Equivalent to 'crumbl-exe/utils/padding_test.go' tests
  describe('leftPads', () => {
    it('should pad and unpad string correctly', () => {
      const length = 12
      const str = 'test'
      let padded = leftPad(str, length)
      padded.length.should.equal(length)

      const padding = '\u0002\u0002\u0002\u0002\u0002\u0002\u0002\u0002'
      const expected = padding + str
      padded.should.equal(expected)

      let unpadded = unpad(padded)
      unpadded.should.equal(str)

      const empty = ''
      padded = leftPad(empty, length)
      padded.length.should.equal(length)
      unpadded = unpad(padded)
      unpadded.should.equal(empty)
    })
  })
  describe('rightPads', () => {
    it('should pad and unpad string correctly', () => {
      const length = 12
      const str = 'test'
      const padded = rightPad(str, length)
      padded.length.should.equal(length)

      const unpadded = unpad(padded)
      unpadded.should.equal(str)
    })
  })
  describe('unpad', () => {
    it('should work appropriately', () => {
      const leftLength = 12
      const rightLength = 16

      const str = 'test'
      let padded = leftPad(str, leftLength)
      padded = rightPad(padded, rightLength)
      padded.length.should.equal(rightLength)

      let unpadded = unpad(padded)
      unpadded.should.equal(str)

      // A padding character in the middle of the string shouldn't change the unpadding behaviour
      const manInTheMiddle = 'test' + LEFT_PADDING_CHARACTER + 'test'
      padded = leftPad(manInTheMiddle, leftLength)
      padded.length.should.equal(leftLength)
      unpadded = unpad(padded)
      unpadded.should.equal(manInTheMiddle)
    })
  })
})