import { seedFor } from '../../../../lib/src/typescript/Slicer/Seed'
import { Slicer, Slice } from '../../../../lib/src/typescript/Slicer'

const slice1: Slice = '11111'
const slice2: Slice = '22222'
const slice3: Slice = '33333'
const slice4: Slice = '44444'

describe('Slicer', () => {
  // Equivalent to 'crumbl-exe/slicer/slicer_test.go' tests
  describe('slice', () => {
    it('should be deterministic', () => {
      const numberOfSlices = 4
      const s1 = Slicer(numberOfSlices, 0)
      const slices1 = s1.slice('11111222223333344444')
      slices1.length.should.equal(numberOfSlices)
      slices1[0].should.equal(slice1)
      slices1[1].should.equal('22222')
      slices1[2].should.equal('33333')
      slices1[3].should.equal('44444')

      const s2 = Slicer(numberOfSlices, 2)
      const slices2 = s2.slice('111111111222222222333333333444444444')
      slices2.forEach(slice => {
        slice.length.should.equal(11)
      })
      //slices2[3].should.equal('\u0002\u0002\u000244444444')
      slices2[3].should.equal('\u00023444444444') // TODO Different from Go implementation due to random generator: change it?
    })
  })
  describe('unslice', () => {
    it('should be deterministic', () => {
      const s1 = Slicer(4, 0)

      const found = s1.unslice([slice1, slice2, slice3, slice4])

      const expected = '11111222223333344444'
      found.should.equal(expected)
    })
  })
  describe('seedFor', () => {
    it('should be deterministic', () => {
      const data1 = 'ab'
      const found = seedFor(data1)
      const expected = '195'
      found.should.equal(expected)
    })
  })
  describe('slice/unslice', () => {
    it('should be invariant', () => {
      const data = randomString()
      const slicer = Slicer(10, data.length)
      const found = slicer.unslice(slicer.slice(data))

      found.should.eqls(data)
    })
  })
})

const randomString = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)