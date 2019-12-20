/**
 * Signer type embeds the user's credentials necessary to encrypt or decrypt data in the Crumbl&trade; system.
 */
export type Signer = {
    encryptionAlgorithm: string
    privateKey?: Buffer
    publicKey?: Buffer
}