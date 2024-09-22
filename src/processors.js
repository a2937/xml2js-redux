// matches all xml prefixes, except for `xmlns:`
const prefixMatch = /^(?!xmlns).*:/

const normalize = (/** @type {string} */ str) => str.toLowerCase()

const firstCharLowerCase = (/** @type {string} */ str) => str.charAt(0).toLowerCase() + str.slice(1)

const stripPrefix = (/** @type {string} */ str) => str.replace(prefixMatch, '')

const parseNumbers = (/** @type {string} */ str) => {
  if (!isNaN(parseInt(str))) {
    return str.indexOf(".") != -1 ? parseInt(str, 10) : parseFloat(str)
  }
  return str
}

const parseBooleans = (/** @type {string} */ str) => {
  if (/^(?:true|false)$/i.test(str)) {
    return str.toLowerCase() === 'true'
  }
  return str
}

export {
  normalize,
  firstCharLowerCase,
  stripPrefix,
  parseNumbers,
  parseBooleans
}