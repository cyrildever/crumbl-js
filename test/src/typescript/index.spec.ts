import { BrowserWorker, CREATION, ECIES_ALGORITHM, euclideanDivision } from '../../../lib/src/typescript'

declare function expect(val: any, message?: string): any

describe('lib', () => {
  it('should create several times in a row', async () => {
    const data = 'qdopdqzpjidqzjoohqefefhouqdouhzhfoqfqzhuzqdhuzdhiuqzhiudqzhiudzhiuqdzihqzdhiu'
    const owner = {
      encryptionAlgorithm: ECIES_ALGORITHM,
      publicKey: Buffer.from('04e315a987bd79b9f49d3a1c8bd1ef5a401a242820d52a3f22505da81dfcd992cc5c6e2ae9bc0754856ca68652516551d46121daa37afc609036ab5754fe7a82a3', 'hex'),
      privateKey: Buffer.from('b9fc3b425d6c1745b9c963c97e6e1d4c1db7a093a36e0cf7c0bf85dc1130b8a0', 'hex')
    }
    const trustee1 = {
      encryptionAlgorithm: ECIES_ALGORITHM,
      publicKey: Buffer.from('040c96f971c0edf58fe4afbf8735581be05554a8a725eae2b7ad2b1c6fcb7b39ef4e7252ed5b17940a9201c089bf75cb11f97e5c53333a424e4ebcca36065e0bc0', 'hex'),
      privateKey: Buffer.from('80219e4d24caf16cb4755c1ae85bad02b6a3efb1e3233379af6f2cc1a18442c4', 'hex')
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const done1 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done2 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done3 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done4 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done5 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done6 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done7 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done8 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done9 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done10 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done11 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done13 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    const done14 = await new BrowserWorker({ mode: CREATION, data: [data] }).create([owner], [trustee1])
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return true
  })
})

describe('euclideanDivision', () => {
  it('should return the appropriate quotient and remainder', () => {
    const numerator = 15
    const denominator = 2
    const [quotient, remainder] = euclideanDivision(numerator, denominator)
    quotient.should.equal(7)
    remainder.should.equal(1)
  })
  it('should throw an error when dividing by zero', () => {
    expect(() => euclideanDivision(23, 0)).to.throw('division by zero') // eslint-disable-line  @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  })
})
