//--- Statuses
export const DEBUG = 'DEBUG'
export const ERROR = 'ERROR'
export const INFO = 'INFO'
export const SUCCESS = 'SUCCESS'
export const WARNING = 'WARNING'

export const logger = {
  log: log
}

/**
 * Format and log to console
 * 
 * @param msg the message to log
 * @param status the status type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG' (default) | etc.
 */
function log(msg: any, status: string = DEBUG): void {
  let logLineDetails = ' '
  try {
    logLineDetails = '- [' + (new Error().stack)!.split('at ')[3].trim() + ']' // eslint-disable-line @typescript-eslint/no-non-null-assertion
  } catch (e) {
    // NO-OP
  }
  const now = new Date()
  console.log(now.toLocaleDateString(), now.toLocaleTimeString(), status, msg, logLineDetails)
}
