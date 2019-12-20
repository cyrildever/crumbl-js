import * as chai from 'chai'
import 'mocha'
chai.should()

import { Crumbl } from '../../../../lib/src/typescript/core/Crumbl'
import { DEFAULT_HASH_ENGINE } from '../../../../lib/src/typescript/crypto'
import { ECIES_ALGORITHM, getPublicKeyBuffer } from '../../../../lib/src/typescript/crypto/ecies'
import { RSA_ALGORITHM } from '../../../../lib/src/typescript/crypto/rsa'
import { Signer } from '../../../../lib/src/typescript/models/Signer'

import fs from 'fs'

const owner1_pubkey = getPublicKeyBuffer(fs.readFileSync('test/src/typescript/crypto/ecies/keys/owner1.pub', 'utf-8'))
const trustee1_pubkey = getPublicKeyBuffer(fs.readFileSync('test/src/typescript/crypto/ecies/keys/trustee1.pub', 'utf-8'))
const trustee2_pubkey = fs.readFileSync('test/src/typescript/crypto/rsa/keys/trustee2.pub')

describe('Crumbl', () => {
    describe('process', () => {
        // Equivalent to 'crumbl-exe/core/crumbl_test.go' tests
        it('should build the crumbled string appropriately', async () => {
            const source = 'cdever@edgewhere.fr'

            const owner1: Signer = {
                encryptionAlgorithm: ECIES_ALGORITHM,
                publicKey: owner1_pubkey
            }
            const trustee1: Signer = {
                encryptionAlgorithm: ECIES_ALGORITHM,
                publicKey: trustee1_pubkey
            }
            const trustee2: Signer = {
                encryptionAlgorithm: RSA_ALGORITHM,
                publicKey: trustee2_pubkey
            }
            const c = new Crumbl(source, DEFAULT_HASH_ENGINE, [owner1], [trustee1, trustee2])
            const crumbled = await c.process()
            console.log(crumbled)
            crumbled.should.not.be.empty
        })
    })
})