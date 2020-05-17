import { Base64 } from '../../../../lib/src/typescript/models/Base64'
import { Slice } from '../../../../lib/src/typescript/Slicer'
import { Uncrumb, parseUncrumb, toUncrumb } from '../../../../lib/src/typescript/Decrypter/Uncrumb'

describe('Uncrumb', () => {
  // Equivalent to 'crumbl-exe/decrypter/uncrumb_test.go' tests
  describe('parse', () => {
    it('should be deterministic', () => {
      const uncrumbStr = '%01RWRnZXdoZXJl'
      const parts = parseUncrumb(uncrumbStr)
      parts[0].should.equal(1)
      parts[1].should.equal('RWRnZXdoZXJl')

      const expected = 'Edgewhere'
      const found = new Base64(parts[1]).decoded()
      found.toString().should.equal(expected)
    })
  })
  describe('toUncrumb', () => {
    it('should build the appropriate object', () => {
      const expected = new Uncrumb(new Base64('RWRnZXdoZXJl'), 1)
      const str = '01RWRnZXdoZXJl' // PARTIAL_PREFIX ignored anyway
      const found = toUncrumb(str)
      found.should.eqls(expected)


    })
  })
  describe('toSlice', () => {
    it('should derive the right slice from an uncrumb', () => {
      const expected: Slice = 'Edgewhere'
      const uncrumb = new Uncrumb(new Base64('RWRnZXdoZXJl'), 1)
      const found: Slice = uncrumb.toSlice()
      found.should.equal(expected)
    })
  })
})
