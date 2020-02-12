import { hash, DEFAULT_HASH_ENGINE } from '../../../../lib/src/typescript/crypto/index'

describe('crypto', () => {
  describe('hash', () => {
    // Equivalent to 'crumbl-exe/crypto/crypto_test.go' tests
    it('should work appropriately', async () => {
      const expected = 'c0c77f225dd222144bc4ef79dca00ab7d955f26da2b1e0f25df81f8a7e86917c'
      const found = await hash('Edgewhere', DEFAULT_HASH_ENGINE)
      return found.should.equal(expected)
    })
  })
})