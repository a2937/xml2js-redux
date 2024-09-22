export function stripBOM(/** @type {string} */ str)
{
  return str[0] === '\uFEFF' ? str.substring(1) : str;
}

