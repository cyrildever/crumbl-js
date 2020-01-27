const forge = require('node-forge')
const pki = forge.pki

/**
 * Encrypt a message with RSA-OAEP and returns the base64-encoded cipher text
 * 
 * @param msg 
 * @param publicKey 
 */
export const encrypt = (msg: Buffer, publicKey: Buffer): string => {
    const pubkey = pki.publicKeyFromPem(publicKey)
    const crypted = pubkey.encrypt(msg, 'RSA-OAEP', {
        md: forge.md.sha512.create()
    })
    return forge.util.encode64(crypted)
}

/**
 * Decrypt a base64-encoded ciphertext
 * 
 * @param msg 
 * @param privateKey
 */
export const decrypt = (msg: string, privateKey: Buffer): string => {
    const privkey = pki.privateKeyFromPem(privateKey)
    return privkey.decrypt(forge.util.decode64(msg), 'RSA-OAEP', {
        md: forge.md.sha512.create()
    })
}
