import { Hasher, Base64 } from '../../../../lib/src/typescript'
import { Crumb } from '../../../../lib/src/typescript/Encrypter/Crumb'

const crumbs: ReadonlyArray<Crumb> = [new Crumb(new Base64('RWRnZXdoZXJl'), 0, 12)]

describe('Hasher', () => {
  describe('apply', () => {
    it('should return the appropriate hashered data', async () => {
      const expected = 'c5066fffa7ee8e9a2013c62b465c993d51f9ec5191435c3e078d8801859c74d6'
      const source = 'data to hash'
      const hasher = new Hasher(crumbs)
      const hashered = await hasher.apply(source)
      console.log('hashered', hashered)
      hashered.should.equal(expected)
    })
  })
  describe('unapply', () => {
    it('should be deterministic', () => {
      const expected = 'c5066fffa7ee8e9a2013c62b465c993d149d8b34e62b394c62c8ec66e0eb1cb3'
      const hashered = 'c5066fffa7ee8e9a2013c62b465c993d51f9ec5191435c3e078d8801859c74d6'
      const hasher = new Hasher(crumbs)
      const found = hasher.unapply(hashered)
      found.should.equal(expected)
    })
  })
})
