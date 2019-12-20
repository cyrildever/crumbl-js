import * as chai from 'chai'
import 'mocha'
chai.should()

import { ECIES_ALGORITHM, getPrivateKeyBuffer } from '../../../../lib/src/typescript/crypto/ecies'
import { hash, DEFAULT_HASH_ENGINE, DEFAUT_HASH_LENGTH } from '../../../../lib/src/typescript/crypto'
import { RSA_ALGORITHM } from '../../../../lib/src/typescript/crypto/rsa'
import { Signer } from '../../../../lib/src/typescript/models/Signer'
import { Uncrumb, toUncrumb, PARTIAL_PREFIX } from '../../../../lib/src/typescript/Decrypter/Uncrumb'
import { Uncrumbl } from '../../../../lib/src/typescript/core/Uncrumbl'
import { VERSION } from '../../../../lib/src/typescript/core/Crumbl'

import fs from 'fs'

const owner1_privkey = getPrivateKeyBuffer(fs.readFileSync('test/src/typescript/crypto/ecies/keys/owner1.sk', 'utf-8'))
const trustee1_privkey = getPrivateKeyBuffer(fs.readFileSync('test/src/typescript/crypto/ecies/keys/trustee1.sk', 'utf-8'))
const trustee2_privkey = fs.readFileSync('test/src/typescript/crypto/rsa/keys/trustee2.sk')

describe('Uncrumbl', () => {
    describe('process', () => {
        // Equivalent to 'crumble-exe/core/uncrumbl_test.go' tests
        it('should uncrumbl appropriately', async () => {
            const expected = 'cdever@edgewhere.fr'
            const crumbled = '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d0000a8BJM2I8mS/bkFNdZOATg8jHsQbzYp4o5rTqYWkf/pqgvkH7a4OijBxy86W1y2J+pB525jYO4iBuig2JswBdNv++8dkb0GcSXT873M0I5Xma9oM83eHXihOF2rqnqWN/RNZPwJSM23DcCj/xyVs1FK5jWVMGxtMLttIN7vqg==010158KbcQ6boXhkGdXR97+UwSHvt12wEwkVa57e+2m+66sTu32luP00cWET2gb01tgNZYjU621U7u4RI6fmz5kkyTSZtjPJ5wXISTf2wOBv5cY94LvgYoyMFKP9J3mGbPgAKGGsIdY4GCQBx6+Gi7VzfuNxdP1YHAPqcpKXPWiY+nmqYhT7eZVZlmNF1UmkMbgrneYglenmKxWSyUA6P7yMj3LrhlKekWAPdWpMLzRftLh1oH5e2KHkz7Wyh9eYOCKXlQ4sUUm8o3i0Inann41wL0KGaNajPU1RP0M9n3/Zil1/T+ZZcNJgSlQh1mxVKX1ztBRqYNUy+pqDat1qq6ED5r5A==0200a8BIIMyYgouCq7ZVy7S1kRJUl1Lg+aQMHoNeo7SauKwsy//XZ5rJOF4FrYMXmPpu0pf7nwCgAgk6Iv9IQK+WXsKpDE+QazdPpYFtxm4/1qi8qnzG1Wp/9Lf5nFTozacHqghz2e7XkaO1qyLNfmzimpsm6aw/lhEsd+djJ8KA==.1'

            const verificationHash = hash(expected, DEFAULT_HASH_ENGINE)

            // 1- As trustees
            let uncrumbs = new Array<Buffer>()
            const trustee1: Signer = {
                encryptionAlgorithm: ECIES_ALGORITHM,
                privateKey: trustee1_privkey
            }
            const uTrustee1 = new Uncrumbl(crumbled, [], '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d', trustee1, false)
            const uncrumb1 = await uTrustee1.process()
            uncrumb1.toString().should.equal('580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%02AgICAgICAgkYUkI=.1') // This shall be returned by the trustee
            uncrumbs.push(uncrumb1)

            const trustee2: Signer = {
                encryptionAlgorithm: RSA_ALGORITHM,
                privateKey: trustee2_privkey
            }
            const uTrustee2 = new Uncrumbl(crumbled, [], '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d', trustee2, false)
            const uncrumb2 = await uTrustee2.process()
            uncrumb2.toString().should.equal('580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%01AgICBFUDDk4PXEc=.1') // This shall be returned by the trustee
            uncrumbs.push(uncrumb2)

            // 2- As an owner
            let fromTrustees = new Array<Uncrumb>()
            for (let i = 0; i < uncrumbs.length; i++) {
                const parts = uncrumbs[i].toString().split('.', 2)
                parts[1].should.equal(VERSION)
                const us = parts[0].substr(DEFAUT_HASH_LENGTH)
                const uncs = us.split(PARTIAL_PREFIX)
                for (let j = 0; j < uncs.length; j++) {
                    const unc = uncs[j]
                    if (unc != '') {
                        const uncrumb = toUncrumb(unc)
                        fromTrustees.push(uncrumb)
                    }
                }
            }

            const owner1: Signer = {
                encryptionAlgorithm: ECIES_ALGORITHM,
                privateKey: owner1_privkey
            }
            const uOwner = new Uncrumbl(crumbled, fromTrustees, verificationHash, owner1, true)
            const found = await uOwner.process()

            found.toString().should.equal(expected)
        })
    })
})