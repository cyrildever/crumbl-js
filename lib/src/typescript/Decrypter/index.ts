import { Base64 } from '../models/Base64'
import { Crumb } from '../Encrypter/Crumb'
import { ECIES_ALGORITHM } from '../crypto'
import * as ecies from '../crypto/ecies'
import { Signer } from '../models/Signer'
import { Uncrumb } from './Uncrumb'

export const decrypt = async (c: Crumb, s: Signer): Promise<Uncrumb> => {
  let decrypted = ''
  if (s.privateKey !== null && s.privateKey !== undefined) {
    switch (s.encryptionAlgorithm) {
      case ECIES_ALGORITHM: {
        // IMPORTANT: the signer's private key hexadecimal string has to be passed through the `ecies.getPrivateKeyBuffer()` function beforehand
        const deciphered = await ecies.decrypt(c.encrypted.toBytes(), s.privateKey)
        decrypted = deciphered.toString('base64')
        break
      }
      default:
        throw new Error('unknown encryption algorithm: ' + s.encryptionAlgorithm)
    }
  }
  return new Uncrumb(new Base64(decrypted), c.index)
}

export * from './Collector'
export * from './Uncrumb'
