import hasher = require('js-sha256')

import { getPublicKeyBuffer, getPrivateKeyBuffer } from './ecies'

export const DEFAULT_HASH_ENGINE = 'sha-256'
export const DEFAUT_HASH_LENGTH = 64

export const ECIES_ALGORITHM = 'ecies'
export const RSA_ALGORITHM = 'rsa'
const authorizedAlgorithms = [ECIES_ALGORITHM, RSA_ALGORITHM]

/**
 * Test whether the passed algorithm is compliant with the current system
 * 
 * @param name the algorithm code name to test
 */
export const existsAlgorithm = (name: string): boolean => {
    return authorizedAlgorithms.includes(name)
}

/**
 * Hash the passed string using SHA-256 hash algorithm (as of the latest version of the Crumbl&trade;)
 * 
 * @param string the data to hash
 * @param hashEngine the name of the hash engine (default: `sha-256`)
 * @returns the hexadecimal representation of the hashed data
 */
export const hash = (data: string, hashEngine: string = DEFAULT_HASH_ENGINE): string => {
    let hashed: string = ''
    if (hashEngine == DEFAULT_HASH_ENGINE) {
        hashed = hasher.sha256(data)
    } else {
        throw new Error('invalid hash engine')
    }
    return hashed
}

export const getKeyBuffer = (key: string, algo: string): Buffer => {
    let keyBuffer: Buffer
    switch (algo) {
        case ECIES_ALGORITHM: {
            // TODO Check that these are permanent features of ECC keys for ECIES
            if (key.length == 130) {
                keyBuffer = getPublicKeyBuffer(key)
            } else if (key.length == 64) {
                keyBuffer = getPrivateKeyBuffer(key)
            } else {
                keyBuffer = Buffer.from(key)
            }
            break
        }
        case RSA_ALGORITHM: {
            keyBuffer = Buffer.from(key)
            break
        }
        default:
            throw new Error('invalid algorithm')
    }
    return keyBuffer
}
