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
    it('should work like in Go', () => {
      const expected = 'cc8b00be1cc7592806ba4f8fe4411d3744121dc12e6201dc36e873f7fd9a6bae'
      const hashered = 'cc8b00be1cc7592806ba4f8fe4411d374064d57e96845c04ed360d0901d64b7a'
      const crumbs = [
        new Crumb(new Base64('BHbIv7jmXdjb3n7+/Ewg1Br4EXYksmb4RmavTQsDVJAFY/he1rs7gpRY9+waPCww3YMzr5IIWFYN8LDVDDxV2bdTGBNjHWbsb4WRM2ItLFVYubxBto/6pfGyXJ0ZriYjL2RCVtPw8cdJrkeXqSqOEz1ICBTN9UOBZw=='), 0, 164),
        new Crumb(new Base64('BLaggeNjl7tsFhAymEipkuIco8xG8trm6E+4WzrTX7spC0DmdyTFhU8enJV2WERxOaF7iy6E64/2+2wIL/MqRMnyRnJJJDab6d7pTWMSEVOUAvEFugTP95XpnnZcDyzLdZ2J+YBbMYtRcnxH4TJA9AIwksl0oJRA/w=='), 0, 164)
      ]
      const hasher = new Hasher(crumbs)
      const found = hasher.unapply(hashered)
      found.should.equal(expected)
    })
  })
})
