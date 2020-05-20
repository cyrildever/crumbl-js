import { START_PADDING_CHARACTER } from ".."

// The minimum number of prepended characters in the padded result
export const PREPEND_SIZE = 2

// Unicode U+0004: end-of-transmission
export const ALTERNATE_PADDING_CHARACTER_1 = '\u0004'

// Unicode U+0005: enquiry
export const ALTERNATE_PADDING_CHARACTER_2 = '\u0005'

export class Padder {
  /**
   * Left pads the passed data (generally a slice) making it at least (PREPEND_SIZE + length) bytes long,
   * except if the 'buildEven' parameter is set to `true`. In that case, it doesn't take PREPEND_SIZE into account
   * and only adds padding bytes to the left up to the passed length to make it odd long.
   * 
   * @param {string} slice - the data to obfuscate
   * @returns the byte array of the obfuscated result
   */
  apply(slice: string, length: number, buildEven?: boolean): string {
    if (slice.length === 0) {
      throw new Error('empty slice')
    }
    if (length < 1) {
      throw new Error('max slice length too short')
    }
    if (buildEven === true && length !== slice.length && length % 2 !== 0) {
      throw new Error('wished length is not even')
    }

    // An already even slice doesn't need processing when buildEven is set to `true` and minimum length is reached
    if (buildEven === true && slice.length % 2 === 0 && slice.length >= length) {
      return slice
    }

    // 1 - Choose padding character
    const firstChar = slice[0]
    const lastChar = slice[slice.length - 1]
    const pc = firstChar === START_PADDING_CHARACTER
      ? lastChar === ALTERNATE_PADDING_CHARACTER_1
        ? ALTERNATE_PADDING_CHARACTER_2
        : ALTERNATE_PADDING_CHARACTER_1
      : lastChar === START_PADDING_CHARACTER
        ? firstChar === ALTERNATE_PADDING_CHARACTER_1
          ? ALTERNATE_PADDING_CHARACTER_2
          : ALTERNATE_PADDING_CHARACTER_1
        : START_PADDING_CHARACTER

    // 2 - Define filling delta
    let delta = Math.max(0, length - slice.length)
    if (buildEven === true) {
      if ((slice.length + delta) % 2 !== 0) {
        delta++
      }
    } else {
      delta += PREPEND_SIZE
    }

    // 3 - Do pad
    let pad = ''
    for (let i = 0; i < delta; i++) {
      pad += pc
    }
    return pad + slice
  }

  /**
   * Unpad the passed data
   * 
   * @param {string} padded - the padded string to use
   * @returns the unpadded string
   */
  unapply(padded: string): string {
    if (padded.length < 2) {
      throw new Error('invalid padded data: data too short')
    }

    // 1 - Detect padding character
    const pc = padded[0]
    if (pc !== START_PADDING_CHARACTER &&
      pc !== ALTERNATE_PADDING_CHARACTER_1 &&
      pc !== ALTERNATE_PADDING_CHARACTER_2) {
      if (padded.length % 2 === 0) {
        // It's probably a data that would have been padded only if it were of odd length,
        // hence probably padded with 'buildEven' set to `true`
        return padded
      } else {
        throw new Error('invalid padded data: wrong padding')
      }
    }

    // 2 - Test prepend sequence
    if (padded.length < PREPEND_SIZE + 1) {
      throw new Error('invalid data: padded data too short')
    }
    if (padded[PREPEND_SIZE - 1] != pc && padded.length % 2 === 1) {
      console.warn('WARNING - possibly wrong padding: data is not of even length and prepend size wasn\'t respected') // TODO Change to error?
    }

    // 3 - Do unpad
    let unpadded = padded
    while (unpadded.length > 0 && unpadded[0] === pc) {
      unpadded = unpadded.substring(1)
    }
    if (unpadded.length === 0) {
      throw new Error('invalid padded data: all pad chars')
    }

    return unpadded
  }
}
