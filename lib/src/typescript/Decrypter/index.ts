import { Base64 } from '../models/Base64'
import { Crumb } from '../Encrypter/Crumb'
import { ECIES_ALGORITHM, RSA_ALGORITHM } from '../crypto'
import * as ecies from '../crypto/ecies'
import { LEFT_PADDING_CHARACTER, RIGHT_PADDING_CHARACTER } from '../../../../lib/src/typescript/utils/padding'
import * as rsa from '../crypto/rsa'
import { Signer } from '../models/Signer'
import { Uncrumb } from './Uncrumb'

export const decrypt = async (c: Crumb, s: Signer): Promise<Uncrumb> => {
    let decrypted = ''
    if (s.privateKey != null) {
        switch (s.encryptionAlgorithm) {
            case ECIES_ALGORITHM: {
                // IMPORTANT: the signer's private key hexadecimal string has to be passed through the `ecies.getPrivateKeyBuffer()` function beforehand
                const deciphered = await ecies.decrypt(c.encrypted.toBytes(), s.privateKey)
                decrypted = deciphered.toString('base64')
                break
            }
            case RSA_ALGORITHM: {
                const deciphered = rsa.decrypt(c.encrypted.toString(), s.privateKey)
                if (deciphered.includes(LEFT_PADDING_CHARACTER) || deciphered.includes(RIGHT_PADDING_CHARACTER)) {
                    decrypted = Buffer.from(deciphered, 'utf-8').toString('base64')
                } else {
                    decrypted = deciphered
                }
                break
            }
            default:
                throw new Error('unknown encryption algorithm: ' + s.encryptionAlgorithm)
        }
    }
    return new Uncrumb(new Base64(decrypted), c.index)
}
