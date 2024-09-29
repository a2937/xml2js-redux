// matches all xml prefixes, except for `xmlns:`
const prefixMatch = /^(?!xmlns).*:/

const normalize = (/** @type {string} */ str: string) => str.toLowerCase()

const firstCharLowerCase = (/** @type {string} */ str: string) => str.charAt(0).toLowerCase() + str.slice(1)

const stripPrefix = (/** @type {string} */ str: string) => str.replace(prefixMatch, '')

const parseNumbers = (/** @type {string} */ str: string) => {
  if (!isNaN(parseInt(str))) {
    return str.indexOf(".") != -1 ? parseInt(str, 10) : parseFloat(str)
  }
  return str
}

const parseBooleans = (/** @type {string} */ str: string) => {
  if (/^(?:true|false)$/i.test(str)) {
    return str.toLowerCase() === 'true'
  }
  return str
}

export default {
  normalize,
  firstCharLowerCase,
  stripPrefix,
  parseNumbers,
  parseBooleans
}