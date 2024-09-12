import { Crumbl } from '../../../../lib/src/typescript/core/Crumbl'
import { DEFAULT_CRYPTO_HASH_ENGINE, ECIES_ALGORITHM } from '../../../../lib/src/typescript/crypto'
import { Signer } from '../../../../lib/src/typescript/models/Signer'

const owner1Pubkey = Buffer.from('04e315a987bd79b9f49d3a1c8bd1ef5a401a242820d52a3f22505da81dfcd992cc5c6e2ae9bc0754856ca68652516551d46121daa37afc609036ab5754fe7a82a3', 'hex')
const trustee1Pubkey = Buffer.from('040c96f971c0edf58fe4afbf8735581be05554a8a725eae2b7ad2b1c6fcb7b39ef4e7252ed5b17940a9201c089bf75cb11f97e5c53333a424e4ebcca36065e0bc0', 'hex')
const trustee3Pubkey = Buffer.from('04e8d931172dd09cff868ec36235512cfedfef632f81d50d7272490c5cfe8efffe3cfcde7f0eba4759456489d3735bf7510a7c4478e8bd9c37873afd0b798693bd', 'hex')

describe('Crumbl', () => {
  describe('process', () => {
    // Equivalent to 'crumbl-exe/core/crumbl_test.go' tests
    it('should build the crumbled string appropriately', async () => {
      const source = 'cdever@edgewhere.fr'

      const owner1: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        publicKey: owner1Pubkey
      }
      const trustee1: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        publicKey: trustee1Pubkey
      }
      const trustee3: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        publicKey: trustee3Pubkey
      }
      const c = new Crumbl(source, DEFAULT_CRYPTO_HASH_ENGINE, [owner1], [trustee1, trustee3])
      const crumbled = await c.process()
      console.log(crumbled)
      return crumbled.should.not.be.empty
    })
  })
})
