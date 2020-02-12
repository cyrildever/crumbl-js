import { hash, DEFAULT_HASH_ENGINE, DEFAUT_HASH_LENGTH, ECIES_ALGORITHM } from '../../../../lib/src/typescript/crypto'
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
      const crumbled = '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d0000a8BPpstHEnG5wfyP6/wt+cJ57+MnM8LCqZmLWZk2m/Lyorl4fVVrwAEj/nG/i/scyoNn/q2NGYjO0Xw1Opcf7XfIqTqq2F+3CXHmu6HXoHDNT1Dh4CJMtKbATXqJT/vaR/QkQ6Gi82aZrT4ycS8HL+tyR4HiIJ5pFQIzMsfw==0100a8BCI8kfWbdcOHBm4kk/fzFtFfIdBZH4HwQmoTabos8AVkYP1k95VtOc0wmyfyIA8hzWdwViDVLLKcKxe1m6Wk3YSQvOQzpN/6EJlx2YPcQ9FzqX5SNDbbMuRts2ZBp4MM7B38UV1phy176pSgFcYwX3wGCuU7cxr8vdWbhQ==0200a8BOfHBiayOHXV9QOCS7dgG3XTic3LPbGts0BdUW45OeQ+8u2AbTM2qeuBtcmUxVfUXCZngcYUSjDRrvaBB6KSuqzm1WKECIrbTN6wRITqFIUj7MczIFwVDZEc3iBUHW6N7/8Y+3z/geq16dpQmOj70JsCE1hMfwAMeA/4Ug==.1'

      const verificationHash = await hash(expected, DEFAULT_HASH_ENGINE)

      // 1- As trustees
      const uncrumbs = new Array<Buffer>()
      const trustee1: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: trustee1Privkey
      }
      const uTrustee1 = new Uncrumbl(crumbled, [], '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d', trustee1, false)
      const uncrumb1 = await uTrustee1.process()
      uncrumb1.toString().should.equal('580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%01AgICBFUDDk4PXEc=.1') // This shall be returned by the trustee
      uncrumbs.push(uncrumb1)

      const trustee3: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: trustee3Privkey
      }
      const uTrustee3 = new Uncrumbl(crumbled, [], '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d', trustee3, false)
      const uncrumb2 = await uTrustee3.process()
      uncrumb2.toString().should.equal('580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%02AgICAgICAgkYUkI=.1') // This shall be returned by the trustee
      uncrumbs.push(uncrumb2)

      // 2- As an owner
      const fromTrustees = new Array<Uncrumb>()
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
        privateKey: owner1Privkey
      }
      const uOwner = new Uncrumbl(crumbled, fromTrustees, verificationHash, owner1, true)
      const found = await uOwner.process()

      found.toString().should.equal(expected)
    })
  })
})