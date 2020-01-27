import * as chai from 'chai'
import 'mocha'
chai.should()

import { Dispatcher } from '../../../../lib/src/typescript/Encrypter/Dispatcher'
import { Signer } from '../../../../lib/src/typescript/models/Signer'

const signer1: Signer = { encryptionAlgorithm: 'ecies1', publicKey: Buffer.from('1') }
const signer2: Signer = { encryptionAlgorithm: 'ecies2', publicKey: Buffer.from('2') }
const signer3: Signer = { encryptionAlgorithm: 'ecies3', publicKey: Buffer.from('3') }

describe('Dispatcher', () => {
    // Equivalent to 'crumbl-exe/encrypter/dispatcher_test.go' tests
    describe('allocate', () => {
        it('should dispatch correctly between signers', () => {
            const d = new Dispatcher(4, [signer1, signer2, signer3])
            const allocation = d.allocate()
            allocation.get(1)!.length.should.equal(2)
            allocation.get(1)![0].should.not.equal(allocation.get(1)![1])
            allocation.get(2)!.length.should.equal(2)
            allocation.get(2)![0].should.not.equal(allocation.get(2)![1])
            allocation.get(3)!.length.should.equal(2)
            allocation.get(3)![0].should.not.equal(allocation.get(3)![1])
        })
    })
})
