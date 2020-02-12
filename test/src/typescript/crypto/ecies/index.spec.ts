import { encrypt, decrypt } from '../../../../../lib/src/typescript/crypto/ecies'
import { fail } from 'assert'

declare function expect(val: any, message?: string): any

describe('crypto/ecies', () => {
  const pubkey = Buffer.from('04e315a987bd79b9f49d3a1c8bd1ef5a401a242820d52a3f22505da81dfcd992cc5c6e2ae9bc0754856ca68652516551d46121daa37afc609036ab5754fe7a82a3', 'hex')
  const privkey = Buffer.from('b9fc3b425d6c1745b9c963c97e6e1d4c1db7a093a36e0cf7c0bf85dc1130b8a0', 'hex')

  // Equivalent to 'crumbl-exe/crypto/ecies/ecies_test.go' tests
  describe('encrypt/decrypt', () => {
    it('should be deterministic', async () => {
      const expected = 'Edgewhere'

      const msg = Buffer.from(expected)
      const crypted = await encrypt(msg, pubkey)
      console.log(crypted.toString('base64'))

      const decrypted = await decrypt(crypted, privkey)
      decrypted.toString().should.equal(expected)
    })
  })
  describe('decrypt', () => {
    it('should decrypt existing ciphertext', async () => {
      const expected = 'Edgewhere'

      const ciphered = Buffer.from('BBgpETRa0Uzt7E4Z1cyvA8dSYK9otpUnCW6fuMMpi342woiV1ChAqdFjfRLvRjSw3AwEkQXsNlT30qJGm6WlF6gnztMcSzMbch+ceLl6/7SNMBBIZxlHiOHWIaSgXdvZexCSgebU+7ilcgf9P9a0ACcoiY5vjoxpJSQ=', 'base64')
      const found1 = await decrypt(ciphered, privkey)
      found1.toString().should.equal(expected)

      const fromGo = Buffer.from('BB76SDcT8FvJbVVs5J7jECfGGOk1T38wx1z8U9erOsyh8JOnYnVtHk7NXbB/FAj8nUpkUPSHBRIVx6+8ChdQ6L7mKSL099Odnomtl+0GMMd6mVOKj7r8Mt6klrSOiHUaq0wsATDThYTl8lGdPwsECQQT8waX+KOWjfo=', 'base64')
      const found2 = await decrypt(fromGo, privkey)
      found2.toString().should.equal(expected)
    })
    it('should not be able to decrypt with another private key', async () => {
      const expected = '\u0002\u0002\u0002\u0002j\f\u000fYMSH'
      const privkey1 = privkey
      const privkey2 = Buffer.from('80219e4d24caf16cb4755c1ae85bad02b6a3efb1e3233379af6f2cc1a18442c4', 'hex')
      const encrypted = Buffer.from('BFimUWhXgnYhTPo7CAQfxBcctdESBrpB/0ECaTPArpxNFr9hLUIJ2nLEwxm2F6xFu8d5sgA9QJqI/Y/PVDem9IxuiFJsAU+4CeUVKYw/nSwwt4Nco8EGBgPY03ekxLD2T3Zp0Z+jowTPtCGHwtuwYE+INwjQgti0Io6E1Q==', 'base64')

      const decrypted1 = await decrypt(encrypted, privkey1)
      decrypted1.toString().should.equal(expected)

      try {
        await decrypt(encrypted, privkey2)
        return fail()
      } catch (e){
        return expect(e.message).to.eqls('Incorrect MAC')
      }
    })
  })
})
