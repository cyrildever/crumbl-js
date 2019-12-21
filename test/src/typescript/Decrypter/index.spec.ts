import * as chai from 'chai'
import 'mocha'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
chai.should()
const expect = chai.expect

import fs from 'fs'

import { Base64 } from '../../../../lib/src/typescript/models/Base64'
import { Crumb } from '../../../../lib/src/typescript/Encrypter/Crumb'
import { decrypt } from '../../../../lib/src/typescript/Decrypter'
import { ECIES_ALGORITHM, getPrivateKeyBuffer } from '../../../../lib/src/typescript/crypto/ecies'
import { encrypt } from '../../../../lib/src/typescript/Encrypter'
import { RSA_ALGORITHM } from '../../../../lib/src/typescript/crypto/rsa'
import { Signer } from '../../../../lib/src/typescript/models/Signer'

describe('Decrypter', () => {
    describe('decrypt', () => {
        it('should be deterministic', async () => {
            const expected1 = 'AgICAgJcRwkYUkI='
            const trustee2_privkey = fs.readFileSync('test/src/typescript/crypto/rsa/keys/trustee2.sk')
            const trustee2_pubkey = fs.readFileSync('test/src/typescript/crypto/rsa/keys/trustee2.pub')
            const trustee2: Signer = {
                encryptionAlgorithm: RSA_ALGORITHM,
                privateKey: trustee2_privkey,
                publicKey: trustee2_pubkey
            }
            const crypted = await encrypt(expected1, 2, trustee2)
            //console.log(crypted)
            let found = await decrypt(crypted, trustee2)
            found.deciphered.encoded.should.equal(expected1)

            const ciphered1 = 'CRN0wdbfDRP5f8D6IdztZEcRc1ZF3AEeHq6z3mcnRKah/t61UyLXAyz4ova2noroMt7Nh8965tJxL9q5r/qpggxf84BOQch3R1AnEE/ol/CGGTV2MvHI0xapZCK76BkS4fxdSJchgigH7fqDIWiMRsKWzZyFgzcb3dF4ZLLDRouLNI3msYbGeicFK4nuqAylt4HCJoRf56trKD1VW92n2WMsREdTQ0JwASRd0yWZGSJf666FM4R12bi42xbkEkO0yMobTl07wCOG/gqAZDfftgnS57+QDiXjr4s0almGOLDv54CULAGjUfA8tEDTJHK0sC86NIV8WPAPyEDp4N023Q=='
            found = await decrypt(new Crumb(new Base64(ciphered1), 2, 168), trustee2)
            found.deciphered.encoded.should.equal(expected1)

            // Equivalent to 'crumbl-exe/decrypter/decrypter_test.go' tests
            const expected2 = 'AgICAmoMD1lNU0g='
            const owner1_privkey = getPrivateKeyBuffer(fs.readFileSync('test/src/typescript/crypto/ecies/keys/owner1.sk', 'utf-8'))
            const owner1: Signer = {
                encryptionAlgorithm: ECIES_ALGORITHM,
                privateKey: owner1_privkey
            }
            const ciphered2 = 'BFimUWhXgnYhTPo7CAQfxBcctdESBrpB/0ECaTPArpxNFr9hLUIJ2nLEwxm2F6xFu8d5sgA9QJqI/Y/PVDem9IxuiFJsAU+4CeUVKYw/nSwwt4Nco8EGBgPY03ekxLD2T3Zp0Z+jowTPtCGHwtuwYE+INwjQgti0Io6E1Q=='
            found = await decrypt(new Crumb(new Base64(ciphered2), 2, 168), owner1)
            found.deciphered.encoded.should.equal(expected2)

            const trustee1_privkey = getPrivateKeyBuffer(fs.readFileSync('test/src/typescript/crypto/ecies/keys/trustee1.sk', 'utf-8'))
            const trustee1: Signer = {
                encryptionAlgorithm: ECIES_ALGORITHM,
                privateKey: trustee1_privkey
            }
            const notToBeFound = decrypt(new Crumb(new Base64(ciphered2), 2, 168), trustee1)
            expect(notToBeFound).to.be.rejectedWith('Incorrect MAC')
        })
    })
})
