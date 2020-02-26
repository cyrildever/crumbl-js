/**
 * Returns the seed specific to the passed data
 * 
 * @param data the string to use as source for the seed
 */
export const seedFor = (data: string): string =>
  Array.from(data)
    .map(char => char.charCodeAt(0))
    .reduce((sum, code) => sum + code, 0)
    .toString()
