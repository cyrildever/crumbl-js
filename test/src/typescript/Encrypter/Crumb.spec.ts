import * as chai from 'chai'
import 'mocha'
chai.should()

import { Crumb, parse, toCrumb } from '../../../../lib/src/typescript/Encrypter/Crumb'
import { Base64 } from '../../../../lib/src/typescript/models/Base64'

describe('Crumb', () => {
    // Equivalent to 'crumbl-exe/encrypter/crumb_test.go' tests
    describe('parse', () => {
        it('should be deterministic', () => {
            const str = '01000cRWRnZXdoZXJl'
            const parts = parse(str)
            parts[0].should.equal(1)
            parts[1].should.equal(12)
            parts[2].should.equal('RWRnZXdoZXJl')

            const expected = 'Edgewhere'
            const found = new Base64(parts[2]).decoded()
            found.toString().should.equal(expected)
        })
    })
    describe('toCrumb', () => {
        it('should build the appropriate object', () => {
            const expected = new Crumb(new Base64('RWRnZXdoZXJl'), 1, 12)
            const str = '01000cRWRnZXdoZXJl'
            const found = toCrumb(str)
            found.should.eqls(expected)

            found.equals(expected).should.be.true
        })
    })
})
