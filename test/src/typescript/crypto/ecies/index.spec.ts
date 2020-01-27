import * as chai from 'chai'
import 'mocha'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
chai.should()
const expect = chai.expect

import * as ecies from 'ecies-geth'
import * as eciesjs from 'eciesjs'
import fs from 'fs'

import { encrypt, decrypt, getPrivateKeyBuffer, getPublicKeyBuffer } from '../../../../../lib/src/typescript/crypto/ecies'

describe('crypto/ecies', () => {
    // Equivalent to 'crumbl-exe/crypto/ecies/ecies_test.go' tests
    describe('encrypt/decrypt', () => {
        it('should be deterministic', async () => {
            const expected = 'Edgewhere'

            const pubkey = fs.readFileSync('test/src/typescript/crypto/ecies/keys/owner1.pub', 'utf-8')
            const msg = Buffer.from(expected)
            const crypted = await encrypt(msg, getPublicKeyBuffer(pubkey))
            console.log(crypted.toString('base64'))

            const privkey = fs.readFileSync('test/src/typescript/crypto/ecies/keys/owner1.sk', 'utf-8')
            const decrypted = await decrypt(crypted, getPrivateKeyBuffer(privkey))
            decrypted.toString().should.equal(expected)
        })
    })
    describe('decrypt', () => {
        it('should decrypt existing ciphertext', async () => {
            const expected = 'Edgewhere'
            const privkey = fs.readFileSync('test/src/typescript/crypto/ecies/keys/owner1.sk', 'utf-8')

            const ciphered = Buffer.from('BBgpETRa0Uzt7E4Z1cyvA8dSYK9otpUnCW6fuMMpi342woiV1ChAqdFjfRLvRjSw3AwEkQXsNlT30qJGm6WlF6gnztMcSzMbch+ceLl6/7SNMBBIZxlHiOHWIaSgXdvZexCSgebU+7ilcgf9P9a0ACcoiY5vjoxpJSQ=', 'base64')
            const found1 = await decrypt(ciphered, getPrivateKeyBuffer(privkey))
            found1.toString().should.equal(expected)

            const fromGo = Buffer.from('BB76SDcT8FvJbVVs5J7jECfGGOk1T38wx1z8U9erOsyh8JOnYnVtHk7NXbB/FAj8nUpkUPSHBRIVx6+8ChdQ6L7mKSL099Odnomtl+0GMMd6mVOKj7r8Mt6klrSOiHUaq0wsATDThYTl8lGdPwsECQQT8waX+KOWjfo=', 'base64')
            const found2 = await decrypt(fromGo, getPrivateKeyBuffer(privkey))
            found2.toString().should.equal(expected)
        })
        it('should not be able to decrypt with another private key', async () => {
            const expected = '\u0002\u0002\u0002\u0002j\f\u000fYMSH'
            const privkey1 = getPrivateKeyBuffer(fs.readFileSync('test/src/typescript/crypto/ecies/keys/owner1.sk', 'utf-8'))
            const privkey2 = getPrivateKeyBuffer(fs.readFileSync('test/src/typescript/crypto/ecies/keys/trustee1.sk', 'utf-8'))
            const encrypted = Buffer.from('BFimUWhXgnYhTPo7CAQfxBcctdESBrpB/0ECaTPArpxNFr9hLUIJ2nLEwxm2F6xFu8d5sgA9QJqI/Y/PVDem9IxuiFJsAU+4CeUVKYw/nSwwt4Nco8EGBgPY03ekxLD2T3Zp0Z+jowTPtCGHwtuwYE+INwjQgti0Io6E1Q==', 'base64')

            const decrypted1 = await decrypt(encrypted, privkey1)
            decrypted1.toString().should.equal(expected)

            const decrypted = decrypt(encrypted, privkey2)
            expect(decrypted).to.be.rejectedWith('Incorrect MAC')
        })
        // Adapted from 'ecies-geth/test/typescript/node.specs.ts' tests
        it('should fail to decrypt if encrypted with another keypair', async () => {
            const msg = Buffer.from('BFimUWhXgnYhTPo7CAQfxBcctdESBrpB/0ECaTPArpxNFr9hLUIJ2nLEwxm2F6xFu8d5sgA9QJqI/Y/PVDem9IxuiFJsAU+4CeUVKYw/nSwwt4Nco8EGBgPY03ekxLD2T3Zp0Z+jowTPtCGHwtuwYE+INwjQgti0Io6E1Q==', 'base64')
            const owner1Pub = Buffer.from('04e315a987bd79b9f49d3a1c8bd1ef5a401a242820d52a3f22505da81dfcd992cc5c6e2ae9bc0754856ca68652516551d46121daa37afc609036ab5754fe7a82a3', 'hex')

            const encrypted = await ecies.encrypt(owner1Pub, msg)

            const owner2Secret = eciesjs.PrivateKey.fromHex('80219e4d24caf16cb4755c1ae85bad02b6a3efb1e3233379af6f2cc1a18442c4').secret
            const decrypted = ecies.decrypt(owner2Secret, encrypted)
            return expect(decrypted).to.be.rejectedWith('Incorrect MAC')
        })
    })
})
