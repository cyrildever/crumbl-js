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
    it('should work as the owner', async () => {
      const expectedBytes = Buffer.from([99, 121, 114, 105, 108, 64, 100, 101, 118, 101, 114, 46, 99, 111, 109])
      let crumbled = 'cc8b00be1cc7592806ba4f8fe4411d3740260115ca8498eec69facc7ca3a4c4a0000a4BPJlFcqvSkE5WJbaV2urVqK+1ui5Ig1YGzKFL7CVhqYi1VK7benFrsOLsXQez2lxzCujoTsL2tzkNsvc0gy5EoOSSlWuuwNthUZInXS9qVG1sJR0E8Jy25xidKNWpRhXoSjtZI93IRfO954Hh0oHDkhpmYf85MwdDA==0000a4BDQc1OTmmTLwd98wN6An5B/NdobkO8Z9uNjvtbGi3q9ei3w4YeUcNPrnDKM9ErJsmJdlRdWVeTiKF1qsEfBPkKtuQQnH6EIamN0sxX/8zg9NDKGtsiS12x3DA3+TcI/6oMqYqk7DgGqFkZPBksk09GJnG/r3frkiqA==0100a4BGnrJEMP0eDfuJHxcv+OxxK3sDqReN6mRru5Kv3MYBv6SYIxq5+B9TQLAV1O6G/c5tRQt035JaFAO94shyGPZqZv4sV8105XH3wbQmN+KhKWalNj3+Cu8qCUbxI+U97XoM1pQi3oZ1j3uul7RO6aFR26pgMcZYm61w==0100a4BGOPcjP5wzwoSld3+X1yvnK5OfusNRkXWkZQzrotJlwJ1utC2554wkwViyLBCGyvIzQKd3L8JOy8smAUg8S67EYTO8FhZRBzz+KnN4k4Asu6uAQRs6iwqFyta9p8sE+rZ0QuAsKzxnNI6HRkFAK1/h3+5JGJp7nXDg==0200a4BPsT4fQJJ4g/wAVJWgBhCLVTWZgliRcSdc8A7J+hiyOG2mEUf/lNayj5z9lakcHK+DELYqbl+GXr3LPve9njifIO9f0rNRSVRErS72kic+CEuFVDjs6N5cKTRGYe2nEBiZXQ6tRTbMDFclInoAMGj+Yh7eWEiYXNpw==0200a4BGCdVlb8xc1w4yuTaHP86YeO8F1SgDzkrn0UgWV0D+8ELWXb4mc4qX1RKSxCMooeWwMiEQFyiHK4q3hTUlNXIkR2G6o6JQE9JwMd8Trw0AjV6aowZ9/e3e1FLWHr8k/0jFMTYa0/DG63uw3yYd/WYLIFht7F0leMUw==0300a4BE5WGLZX+jLrcxCz381u9Vx1yECpLIVg/SXv5/lx4lHZpxXywQMuRpEUQKF5QwDXrF8x6HrOHjLl2/9UmL7p7c7H295bXwt+Ok3Pk8+x+2ulXRnlrghvfvBiaclYcuitR58+g5y7cJWKCf1T3Z5+5Ufh01wEnBK+jg==0300a4BBL5L3jo8KNHN5UErzQ3j+9c2OndPWf6hqs43fek6xfU5tWTpcf86yb/ZSxkcj1fe7ZF+v5x788mjPUJfOC+WyCUZ/+du8atZVkbT4pliSj85vBc2O1brupGKIvhfRPRNzoqpocPSyPAnu/rkS7FOgj+hYjEBiX3LQ==.1'
      let verificationHash = 'cc8b00be1cc7592806ba4f8fe4411d3744121dc12e6201dc36e873f7fd9a6bae'
      let owner: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: Buffer.from('325ab5aace32d823f990a2057119bedddf0d7a8ddc8b19e61d89e73d4531c587', 'hex')
      }
      const uncrumb1 = toUncrumb('01BAQEBAYkUgI=.1')
      const uncrumb2 = toUncrumb('02AgICAk5WGh0=.1')
      const uncrumb3 = toUncrumb('03BAQEBARRVgI=.1')
      let uncrumbler = new Uncrumbl(crumbled, [uncrumb1, uncrumb2, uncrumb3], verificationHash, owner, true)
      const uncrumbBuffer = await uncrumbler.process()
      uncrumbBuffer.should.eqls(expectedBytes)

      const expected = '0140460018'
      crumbled = '4f3d9ab848e2385fec57c5f77d9ce452d1a9555fb5ae84e2f946ee0fcd17cc9c0000a0BCIqW/tmQxcqmXEDlOxJOvZecEiTd1ZaWR/tTXu4xrIzF+ExRdSXgMUC6tjvsdxpMH1oiRSGiker2qtrkUIAwQhEb3rRNt0vXz9RW7kdOiK3zgvB4H8e1qIUM6DDWh604hhhsRKiYfbF7J5QgvL2LyjwJGBUZA==0000a0BB5xSA45Omrp+3+3NBU4Q8qxngenRYuJu18/Nmm6btJ6YyapRhzPXaq7QQ/nUFOffLvvtIODfQQPq15mJz/0FXE15CKwPaftUWF60a82/p4yK8Pwk2HM5pQEjp8/FYWfrKGRBoqP8auEIEc1edihL0pXlEfUYA==0100a0BEpj2JOuhV6I90ADdGe3Q125MCcJeo+4oeRQEZ/kLKFTmckkqjY+cVlIP/xfCMCJ3Kb8ZRTSgpNPxTZbcJ3nY+y8s0ZHb+mMP0G4YWn8RvR5aBR9RHYcMitV40FftaM0Tbffpu73eAKzwYFE8WVYjOgxhxmhiw==0100a0BO/OhTw6Z+qEZR/v9jbqXPxuJ38mx+GjPrYxmuUfkquAPh0/84uT8zXLT+AKzA4BSkHFnVmUslKfoAMX2qs/b1Im5NQM9p/lrsom5KIcJ87WqT5On7pIJAmUxPF3uzO+fIZDTJV092tA1e5JX/FxsoMq+XL7tw==0200a0BNXwd3XVmKl5Kk7VUYtUhsNtR6pwfuat4g88FzdyVKikbgZfw0HdcfBQbHJf4beNsftvhAZnJz7PeapdhXoEPNtI+v8BHF36H1Z04D9DF0OZA2J4mGsyRjoEeU34YLJXOYCPJb+XKEe8HgPoF3orXULAg/dDIQ==0200a0BNLENz/LsmP1bt0RotwBv27mjfOTP0mMfE6VchAR6WlfTBGHlHgDUAmwd9MlyXNutnPmefs3MCf0bXTeYC33ItX8j5a2cbJ9gjCTZiI3w6+PgnSrVaV317VHmyWWpFTjh5uPoJe7L/jyKFGqoT3sMUHfRZJ9aA==0300a0BPrEgqpct/Y6W668/ohct5FlxDxa11EZnCt0/YhKzpmGLEbGkfJuyHIiXDqcp94as71dTYbhTYLE5GMbhllq7GkK7pGz3hlkRO+dkFmMuifGkq5QlCZOi7Vacs0Sj2U7TAvNTT0T9HbttrVbQuDa71yIx9Zlvg==0300a0BLp+x5BTOjDiHNOg6OtZ7RPBL97MeSwPVZB5LBAscdvY0t6SjObMk5jK7F1H1pXQTI4Xe9mVrRbTCZhStXBJthhc4u9LeYlHCDsYICRx2IWFzcDNLYZSMMHE7drRB4lpH8FLELSsEYLau8eVVJ2r7jnZruwdSA==.1'
      verificationHash = '4f3d9ab848e2385fec57c5f77d9ce452d5b72417bb97be8810bd91b8f902f4df'
      owner = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: Buffer.from('7f2a59ae79dbdb984a8b05e1cc4845fa161ba9b7976de713b373540100232ab0', 'hex')
      }
      const uncrumb4 = toUncrumb('01AgICUVU=.1')
      const uncrumb5 = toUncrumb('02AgJXUFk=.1')
      const uncrumb6 = toUncrumb('03AgJRBVI=.1')
      uncrumbler = new Uncrumbl(crumbled, [uncrumb4, uncrumb5, uncrumb6], verificationHash, owner, true)
      const uncrumb = await uncrumbler.process()
      uncrumb.toString().should.equal(expected)
    })
  })
})
