import { Signer } from '../../../../../lib/src/typescript/models/Signer'
import { ECIES_ALGORITHM, BrowserWorker, EXTRACTION } from '../../../../../lib/src/typescript'

describe('Worker', () => {
  describe('extract', () => {
    it('should work with one out of three trustees', async () => {
      const expected = '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%01AgICBFUDDk4PXEcJ.1'
      const crumbled = '580fb8a91f05833200dea7d33536aaec99e56da492685aac67505a2e91e6f7040000a8BJmGgfjwAkIPs2rPt1y3mRZzx+f/o/cs7IBhaRb0SyxwsHvL1SKx+yH4HQU6ZK30h1Dtbwpx0HkIEqjfg4gWmFqNOQTHm4Ry+XdN6Aucrt0CpHPCSNc8mA0sQa9STKM89M4XQ46Mf1AJ8oWpyV5AvmmM7SULvJA8oS7UXwE=0100a8BEq0u3vV/c/wS2IrN2ph+HLAGG8AHk8o5tlOCJ8osXDWaej+0DeksO78Y0dVilcIDnHQv7P5Rhpcj+N8dHSrul5s1aRkSuu4nSY6bk9Tev4mCKWRFVpwUWaPBPPxK+j/hgCk4/hDPUU2bV/egmyKTOJijuNS/ebEmwTpUXU=0200a8BEGzuG7r4DZ3DHW6g851iAL3Vf+L4GV/8kQdDHrVdFJn/zhkrD7AM2LS+BmJ9dl3M3omMwuG+RDtzbjfRo7Lfpa3WgQBWARgHgpCzJIO8DCbEDLP0u4BcHOQtxW1cGu/ChSMCx/VhaIxj8TWQ7AdonjCUWxMtI39KerQUHk=.1'
      const user: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: Buffer.from('80219e4d24caf16cb4755c1ae85bad02b6a3efb1e3233379af6f2cc1a18442c4', 'hex')
      }
      const workerExtractor = new BrowserWorker({
        mode: EXTRACTION,
        data: [crumbled],
        verificationHash: '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d'
      })
      const found = await workerExtractor.extract(user, false)
      found.should.equal(expected)
    })
    // Equivalent to 'crumble-exe/client/worker_test.go' tests
    it('should decipher data with everything needed', async () => {
      const expected = 'cdever@edgewhere.fr'
      const crumbled = '580fb8a91f05833200dea7d33536aaec99e56da492685aac67505a2e91e6f7040000a8BJmGgfjwAkIPs2rPt1y3mRZzx+f/o/cs7IBhaRb0SyxwsHvL1SKx+yH4HQU6ZK30h1Dtbwpx0HkIEqjfg4gWmFqNOQTHm4Ry+XdN6Aucrt0CpHPCSNc8mA0sQa9STKM89M4XQ46Mf1AJ8oWpyV5AvmmM7SULvJA8oS7UXwE=0100a8BEq0u3vV/c/wS2IrN2ph+HLAGG8AHk8o5tlOCJ8osXDWaej+0DeksO78Y0dVilcIDnHQv7P5Rhpcj+N8dHSrul5s1aRkSuu4nSY6bk9Tev4mCKWRFVpwUWaPBPPxK+j/hgCk4/hDPUU2bV/egmyKTOJijuNS/ebEmwTpUXU=0200a8BEGzuG7r4DZ3DHW6g851iAL3Vf+L4GV/8kQdDHrVdFJn/zhkrD7AM2LS+BmJ9dl3M3omMwuG+RDtzbjfRo7Lfpa3WgQBWARgHgpCzJIO8DCbEDLP0u4BcHOQtxW1cGu/ChSMCx/VhaIxj8TWQ7AdonjCUWxMtI39KerQUHk=.1'
      const partialUncrumb1 = '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%01AgICBFUDDk4PXEc=.1'
      const partialUncrumb2 = '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%02AgICAgICAgkYUkI=.1'
      const user: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: Buffer.from('b9fc3b425d6c1745b9c963c97e6e1d4c1db7a093a36e0cf7c0bf85dc1130b8a0', 'hex')
      }
      const workerExtractor = new BrowserWorker({
        mode: EXTRACTION,
        data: [crumbled, partialUncrumb1, partialUncrumb2],
        verificationHash: '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d'
      })
      const found = await workerExtractor.extract(user, true)
      found.should.equal(expected)
    })
  })
})
