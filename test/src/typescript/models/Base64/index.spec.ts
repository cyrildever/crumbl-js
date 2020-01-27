import * as chai from 'chai'
import 'mocha'
chai.should()

import { Base64, toBase64 } from '../../../../../lib/src/typescript/models/Base64'

describe('Base64', () => {
    describe('toBase64', () => {
        it('should be deterministic', () => {
            const expected = 'AgICBFUDDk4PXEc='
            const str = '\u0002\u0002\u0002\u0004U\u0003\u000eN\u000f\\G'
            const b64 = toBase64(Buffer.from(str, 'utf-8'))
            b64.should.eqls(new Base64(expected))
        })
    })
})