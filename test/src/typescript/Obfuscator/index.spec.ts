import { FPECipher } from 'feistel-cipher'

import { Obfuscator, DEFAULT_HASH_ENGINE, DEFAULT_KEY_STRING, DEFAULT_ROUNDS } from '../../../../lib/src/typescript/Obfuscator'

describe('Obfuscator', () => {
  const feistel = new FPECipher(DEFAULT_HASH_ENGINE, DEFAULT_KEY_STRING, DEFAULT_ROUNDS)

  // Almost equivalent to 'crumbl-exe/obfuscator/obfuscator_test.go' tests
  describe('apply', () => {
    it('should be deterministic', () => {
      const obfuscator = new Obfuscator(feistel)
      let found = obfuscator.apply('\u0002Edgewhere')

      let expected = '3d7c0a0f51415a521054'
      found.toString('hex').should.equal(expected)

      found = obfuscator.apply('Edgewhere')
      expected = '2a5d07024f5a501409'
      found.toString('hex').should.equal(expected)
    })
  })
  describe('unapply', () => {
    it('should be deterministic', () => {
      const obfuscator = new Obfuscator(feistel)
      const found = obfuscator.unapply(Buffer.from('3d7c0a0f51415a521054', 'hex'))

      const expected = '\u0002Edgewhere'
      found.should.equal(expected)
    })
  })
})
