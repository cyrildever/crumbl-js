import * as chai from 'chai'
import 'mocha'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
chai.should()
const expect = chai.expect

import fs from 'fs'

import { encrypt, decrypt } from '../../../../../lib/src/typescript/crypto/rsa'

describe('crypto/rsa', () => {
    // Equivalent to 'crumbl-exe/crypto/rsa/rsa_test.go' tests
    describe('encrypt/decrypt', () => {
        it('should be working as expected', () => {
            const expected = 'Edgewhere'

            const pubkey = fs.readFileSync('test/src/typescript/crypto/rsa/keys/trustee2.pub')
            const msg = Buffer.from(expected)
            const crypted = encrypt(msg, pubkey)
            console.log(crypted)

            const privkey = fs.readFileSync('test/src/typescript/crypto/rsa/keys/trustee2.sk')
            const decrypted = decrypt(crypted, privkey)
            decrypted.toString().should.equal(expected)
        })
    })
    describe('encrypt', () => {
        it('should not accept too long input', () => {
            const veryLongStr = 'abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrs'

            // This example uses a 2048 bits long RSA key.
            const pubkey = fs.readFileSync('test/src/typescript/crypto/rsa/keys/trustee2.pub')

            // For RSA key of 2048 bits (256 bytes), using the SHA-512 hash of 64 bytes long with OAEP,
            // the RSA padding will be 2 * 64 + 2 = 130 bytes.
            // Hence, the max length of the data would be 256 - 130 = 126 bytes.
            veryLongStr.length.should.be.above(256 - (2 * 64 + 2))

            expect(function () {
                encrypt(Buffer.from(veryLongStr), pubkey)
            }).to.throw('RSAES-OAEP input message length is too long.')
        })
    })
    describe('decrypt', () => {
        it('should decrypt existing ciphertext', () => {
            const expected = 'Edgewhere'
            const privkey = fs.readFileSync('test/src/typescript/crypto/rsa/keys/trustee2.sk')

            const ciphered = 'Y7MqItzPFiWIgyhzXNqllmZnaIT1N82kMBfExUv0XrJMrXLRfp/60zSZJbcSIWxXxqqCpW99bcjFtadzveMUaf/T8DvHyXmJXVtOb28ep9mzSoIkyveGxIKZ1347A9kQ2FIzbNlC4UH3ooROu+BXHw/VpaYZCOcupO2RqXC/6OLYi8g02uZQZiIbnkrx/jOXDK/HyQabhb24y+7i53QTROonJUXQE2cE+Q7AIFN7mOZR718dqWu2jGllGFeE5nABreTG6ySqzvVOisPrTqlojXHHe/StCwp8R/oP+cmQN2M1lvzMxFOE26pTNEU1oiJCWBV07aoXZofz/g8hKDL1xg=='
            const found1 = decrypt(ciphered, privkey)
            found1.should.equal(expected)

            const fromGo = 'QkordMcNgkQEV3NU5d2zcfmPfmUHnj/bXg7TpcgQqQzpuUhoExNpjNarNoZ+HMwRAzhtqzyIoaFERsTRi8lMiehX9+dvEZNqqNvCt5huRkgwW0g+FHYi2TTdgmCLuKJoBwtsun17o69HeoK9nmG6UXvocx/OPzUJEgHIVggW3ibk4j/uvCtCPiL44IV86JsOMaJewbKEXNMGGWuKsN25c93vr6tS+B4YhR5VFWc93ENdnK+3SIwcOGfNaJLunmRN96AsdDLU9J3Bsl93JH8xSnW1Q8paKqCliFxHXOAvsWbcGRMO2FfDXLCf+bBBZLxQrfSg7O+tn1WQfe0UVjY7Sw=='
            const found2 = decrypt(fromGo, privkey)
            found2.should.equal(expected)

            const otherTest = 'ALYbfype+2Rw+/dbisShJDggI3Rl02DtrLFiY0Uy1FlZUdzDPxNUyv/omzFSGtgyuqeYuizUuIO+qlAcPUkbdw0zEZewJu6NBH6G8GEL9yLpqx1bMYLTGLvIOfOwtlQDpcuXYIMzPFu15ePVkyTUjJq84Y0bg7RU61HV0VCWjJu0jeG9PVN8Nsy2E1tevqnONjs5MGESFasHcBApR7FqWxrGxwQkiJch8X4vtPdYE6uiDJrwdRjIUHpC4RQ1gXOwRF6QwnftJ+g7KHt9sRStExZtcUdB1DY1AiLDcTdXykyNpLqFTWP+n49Gov3Kc5UibLJDHLVb3Q8dIQAnIU9Jaw=='
            const found3 = decrypt(otherTest, privkey)
            found3.should.equal('\u0002\u0002\u0002\u0002v\u0004U\u0003\u000eN\u000f')
        })
    })
})
