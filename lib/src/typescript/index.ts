/*

BSD-2-Clause-Patent License

Copyright (c) 2020 Edgewhere SAS

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

Subject to the terms and conditions of this license, each copyright holder and contributor hereby grants to those receiving rights under this license a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except for failure to satisfy the conditions of this license) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer this software, where such license applies only to those patent claims, already acquired or hereafter acquired, licensable by such copyright holder or contributor that are necessarily infringed by:

  (a) their Contribution(s) (the licensed copyrights of copyright holders and non-copyrightable additions of contributors, in source or binary form) alone; or
  (b) combination of their Contribution(s) with the work of authorship to which such Contribution(s) was added by such copyright holder or contributor, if, at the time the Contribution is added, such addition causes such combination to be necessarily infringed. The patent license shall not apply to any other combinations which include the Contribution.

Except as expressly stated above, no rights or licenses from any copyright holder or contributor is granted under this license, whether expressly, by implication, estoppel or otherwise.

DISCLAIMER

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

export * from './client'
export * from './client/Browser/Worker'
export * from './core/Crumbl'
export * from './core/Uncrumbl'
export * from './Decrypter'
export * from './Encrypter'
export * from './Hasher'
export * from './Obfuscator'
export * from './Slicer'

export * from './crypto'
export * from './models/Base64'
export * from './models/Signer'

// Unicode U+0002: start of text
export const START_PADDING_CHARACTER = '\u0002'

// Unicode U+0003: end of text
export const END_PADDING_CHARACTER = '\u0003'

export const unpad = (str: string): string => {
  while (str.startsWith(START_PADDING_CHARACTER)) {
    str = str.substr(1)
  }
  while (str.endsWith(END_PADDING_CHARACTER)) {
    str = str.substr(0, str.length - 1)
  }
  return str
}

/**
 * Compute the euclidean division of the passed integers
 * 
 * @param {number} numerator - the numerator integer
 * @param {number} denominator - the denominator integer
 * @returns a tuple of (quotient, remainder) integers
 * @throws division by zero
 */
export const euclideanDivision = (numerator: number, denominator: number): [number, number] => {
  if (denominator === 0) {
    throw new Error('division by zero')
  }
  const quotient = Math.floor(numerator / denominator)
  const remainder = numerator % denominator
  return [quotient, remainder]
}
