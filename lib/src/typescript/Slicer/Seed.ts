/**
 * Returns the seed specific to the passed data
 * 
 * @param data the string to use as source for the seed
 */
export const seedFor = (data: string): string => {
    let s = 0
    for (let i = 0; i < data.length; i++) {
        s += data.charCodeAt(i)
    }
    return s.toString()
}
