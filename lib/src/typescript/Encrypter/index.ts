import { Base64 } from '../models/Base64'
import { Crumb } from './Crumb'
import { ECIES_ALGORITHM } from '../crypto'
import * as ecies from '../crypto/ecies'
import { Signer } from '../models/Signer'
import { Slice } from '../Slicer/index'

export const encrypt = async (data: Slice, index: number, s: Signer): Promise<Crumb> => {
  let crypted = ''
  if (s.publicKey != null) {
    switch (s.encryptionAlgorithm) {
      case ECIES_ALGORITHM: {
        // IMPORTANT: the signer's public key hexadecimal string has to be passed through the `ecies.getPublicKeyBuffer()` function beforehand
        const ciphered = await ecies.encrypt(Buffer.from(data), s.publicKey)
        crypted = ciphered.toString('base64')
        break
      }
      default:
        throw new Error('unknown encryption algorithm: ' + s.encryptionAlgorithm)
    }
  } else {
    throw new Error('invalid empty public key')
  }
  const b64 = new Base64(crypted)
  return new Crumb(b64, index, b64.length())
}
