import * as chai from 'chai'
import 'mocha'
chai.should()

import { hash, DEFAULT_HASH_ENGINE } from '../../../../lib/src/typescript/crypto/index'

describe('crypto', () => {
    describe('hash', () => {
        // Equivalent to 'crumbl-exe/crypto/crypto_test.go' tests
        it('should work appropriately', () => {
            const expected = 'c0c77f225dd222144bc4ef79dca00ab7d955f26da2b1e0f25df81f8a7e86917c'
            const found = hash('Edgewhere', DEFAULT_HASH_ENGINE)
            found.should.equal(expected)
        })
    })
})