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
export const hash = (data: string, hashEngine: string = DEFAULT_HASH_ENGINE): Promise<string> => new Promise((resolve, reject) => {
  if (hashEngine !== DEFAULT_HASH_ENGINE)
    reject(new Error('invalid hash engine'))

  resolve(crypto.subtle.digest(hashEngine, Buffer.from(data)).then(digested => Buffer.from(digested).toString('hex')))
})
