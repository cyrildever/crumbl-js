// Unicode U+0002: start of text
export const LEFT_PADDING_CHARACTER = '\u0002'

// Unicode U+0003: end of text
export const RIGHT_PADDING_CHARACTER = '\u0003'

export const leftPad = (str: string, minLength: number): string => {
    if (str.length >= minLength) {
        return str
    }
    while (str.length < minLength) {
        str = LEFT_PADDING_CHARACTER + str
    }
    return str
}

export const rightPad = (str: string, minLength: number): string => {
    if (str.length >= minLength) {
        return str
    }
    while (str.length < minLength) {
        str += RIGHT_PADDING_CHARACTER
    }
    return str
}

export const unpad = (str: string): string => {
    while (str.startsWith(LEFT_PADDING_CHARACTER)) {
        str = str.substr(1)
    }
    while (str.endsWith(RIGHT_PADDING_CHARACTER)) {
        str = str.substr(0, str.length - 1)
    }
    return str
}