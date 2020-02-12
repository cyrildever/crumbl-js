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
    it('should be deterministic', () => {
      const obfuscator = new Obfuscator(DEFAULT_KEY_STRING, DEFAULT_ROUNDS)
      const found = obfuscator.unapply(Buffer.from('3d7c0a0f51415a521054', 'hex'))

      const expected = 'Edgewhere'
      found.should.equal(expected)
    })
  })
})
