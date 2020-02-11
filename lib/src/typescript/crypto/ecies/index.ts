import * as ecies from 'ecies-geth'

/**
 * Eventually returns the ECIES-encrypted buffer of the passed message
 * 
 * @param msg the message to encrypt
 * @param publicKey the hexadecimal string representation of the public key passed through the `getPublicKeyBuffer()` function
 */
export const encrypt = (msg: Buffer, publicKey: Buffer): Promise<Buffer> => {
  return ecies.encrypt(publicKey, msg)
}

/**
 * Eventually returns the ECIES-decrypted buffer of the passed ciphertext
 * 
 * @param ciphered the ciphertext to decrypt
 * @param privateKey the hexadecimal string representation of the private key passed through the `getPrivateKeyBuffer()` function
 */
export const decrypt = (ciphered: Buffer, privateKey: Buffer): Promise<Buffer> => {
  return ecies.decrypt(privateKey, ciphered)
}
