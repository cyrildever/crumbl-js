import { Obfuscator, DEFAULT_KEY_STRING, DEFAULT_ROUNDS } from '../../../../lib/src/typescript/Obfuscator'

describe('Obfucator', () => {
  // Equivalent to 'crumbl-exe/obfuscator/obfuscator_test.go' tests
  describe('apply', () => {
    it('should be deterministic', () => {
      const obfuscator = new Obfuscator(DEFAULT_KEY_STRING, DEFAULT_ROUNDS)
      const found = obfuscator.apply('Edgewhere')

      const expected = '3d7c0a0f51415a521054'
      found.toString('hex').should.equal(expected)
    })
  })
  describe('unapply', () => {
    it('should be deterministic', async () => {
      const verificationHash = 'c0c77f225dd222144bc4ef79dca00ab7d955f26da2b1e0f25df81f8a7e86917c'
      const obfuscator = new Obfuscator(DEFAULT_KEY_STRING, DEFAULT_ROUNDS)
      const found = await obfuscator.unapply(Buffer.from('3d7c0a0f51415a521054', 'hex'), verificationHash)

      const expected = 'Edgewhere'
      found.should.equal(expected)
    })
  })
})
