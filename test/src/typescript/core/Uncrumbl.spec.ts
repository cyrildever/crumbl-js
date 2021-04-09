import { hash, DEFAULT_CRYPTO_HASH_ENGINE, DEFAULT_HASH_LENGTH, ECIES_ALGORITHM } from '../../../../lib/src/typescript/crypto'
import { Signer } from '../../../../lib/src/typescript/models/Signer'
import { Uncrumb, toUncrumb, PARTIAL_PREFIX } from '../../../../lib/src/typescript/Decrypter/Uncrumb'
import { Uncrumbl } from '../../../../lib/src/typescript/core/Uncrumbl'
import { VERSION } from '../../../../lib/src/typescript/core/Crumbl'

const owner1Privkey = Buffer.from('b9fc3b425d6c1745b9c963c97e6e1d4c1db7a093a36e0cf7c0bf85dc1130b8a0', 'hex')
const trustee1Privkey = Buffer.from('80219e4d24caf16cb4755c1ae85bad02b6a3efb1e3233379af6f2cc1a18442c4', 'hex')
const trustee3Privkey = Buffer.from('8bf49f4ccb80e659c65a7bf127a292d30584d0b9f9bf1cd84bee425eb2a3ab9e', 'hex')

describe('Uncrumbl', () => {
  describe('process', () => {
    // Equivalent to 'crumble-exe/core/uncrumbl_test.go' tests
    it('should uncrumbl appropriately', async () => {
      const expected = 'cdever@edgewhere.fr'
      const crumbled = '580fb8a91f05833200dea7d33536aaec99e56da492685aac67505a2e91e6f7040000a8BJmGgfjwAkIPs2rPt1y3mRZzx+f/o/cs7IBhaRb0SyxwsHvL1SKx+yH4HQU6ZK30h1Dtbwpx0HkIEqjfg4gWmFqNOQTHm4Ry+XdN6Aucrt0CpHPCSNc8mA0sQa9STKM89M4XQ46Mf1AJ8oWpyV5AvmmM7SULvJA8oS7UXwE=0100a8BEq0u3vV/c/wS2IrN2ph+HLAGG8AHk8o5tlOCJ8osXDWaej+0DeksO78Y0dVilcIDnHQv7P5Rhpcj+N8dHSrul5s1aRkSuu4nSY6bk9Tev4mCKWRFVpwUWaPBPPxK+j/hgCk4/hDPUU2bV/egmyKTOJijuNS/ebEmwTpUXU=0200a8BEGzuG7r4DZ3DHW6g851iAL3Vf+L4GV/8kQdDHrVdFJn/zhkrD7AM2LS+BmJ9dl3M3omMwuG+RDtzbjfRo7Lfpa3WgQBWARgHgpCzJIO8DCbEDLP0u4BcHOQtxW1cGu/ChSMCx/VhaIxj8TWQ7AdonjCUWxMtI39KerQUHk=.1'

      const verificationHash = await hash(expected, DEFAULT_CRYPTO_HASH_ENGINE)

      // 1- As trustees
      const uncrumbs = new Array<Buffer>()
      const trustee1: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: trustee1Privkey
      }
      const uTrustee1 = new Uncrumbl(crumbled, [], '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d', trustee1, false)
      const uncrumb1 = await uTrustee1.process()
      uncrumb1.toString().should.equal('580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%01AgICBFUDDk4PXEcJ.1') // This shall be returned by the trustee
      uncrumbs.push(uncrumb1)

      const trustee3: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: trustee3Privkey
      }
      const uTrustee3 = new Uncrumbl(crumbled, [], '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d', trustee3, false)
      const uncrumb2 = await uTrustee3.process()
      uncrumb2.toString().should.equal('580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%02AgICAgICAgICGFJC.1') // This shall be returned by the trustee
      uncrumbs.push(uncrumb2)

      // 2- As an owner
      const fromTrustees = new Array<Uncrumb>()
      for (let i = 0; i < uncrumbs.length; i++) {
        const parts = uncrumbs[i].toString().split('.', 2)
        parts[1].should.equal(VERSION)
        const us = parts[0].substr(DEFAULT_HASH_LENGTH)
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
        privateKey: owner1Privkey
      }
      const uOwner = new Uncrumbl(crumbled, fromTrustees, verificationHash, owner1, true)
      const found = await uOwner.process()

      found.toString().should.equal(expected)
    })
    it('should work as one out of three trustees', async () => {
      const expected = '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%01AgICBFUDDk4PXEcJ.1'
      const crumbled = '580fb8a91f05833200dea7d33536aaec99e56da492685aac67505a2e91e6f7040000a8BJmGgfjwAkIPs2rPt1y3mRZzx+f/o/cs7IBhaRb0SyxwsHvL1SKx+yH4HQU6ZK30h1Dtbwpx0HkIEqjfg4gWmFqNOQTHm4Ry+XdN6Aucrt0CpHPCSNc8mA0sQa9STKM89M4XQ46Mf1AJ8oWpyV5AvmmM7SULvJA8oS7UXwE=0100a8BEq0u3vV/c/wS2IrN2ph+HLAGG8AHk8o5tlOCJ8osXDWaej+0DeksO78Y0dVilcIDnHQv7P5Rhpcj+N8dHSrul5s1aRkSuu4nSY6bk9Tev4mCKWRFVpwUWaPBPPxK+j/hgCk4/hDPUU2bV/egmyKTOJijuNS/ebEmwTpUXU=0200a8BEGzuG7r4DZ3DHW6g851iAL3Vf+L4GV/8kQdDHrVdFJn/zhkrD7AM2LS+BmJ9dl3M3omMwuG+RDtzbjfRo7Lfpa3WgQBWARgHgpCzJIO8DCbEDLP0u4BcHOQtxW1cGu/ChSMCx/VhaIxj8TWQ7AdonjCUWxMtI39KerQUHk=.1'

      const trustee1: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: Buffer.from('80219e4d24caf16cb4755c1ae85bad02b6a3efb1e3233379af6f2cc1a18442c4', 'hex')
      }
      const uTrustee1 = new Uncrumbl(crumbled, [], '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d', trustee1, false)
      const uncrumb1 = await uTrustee1.process()
      uncrumb1.toString().should.equal(expected)
    })
  })
})
