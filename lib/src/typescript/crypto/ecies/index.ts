import * as eciesjs from 'eciesjs'

const ecies = require('ecies-geth')

export const ECIES_ALGORITHM = 'ecies'

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

export const getPrivateKeyBuffer = (key: string): Buffer => {
    return eciesjs.PrivateKey.fromHex(key).secret
}

export const getPublicKeyBuffer = (key: string): Buffer => {
    return eciesjs.PublicKey.fromHex(key).uncompressed
}

