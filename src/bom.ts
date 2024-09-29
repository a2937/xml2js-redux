export function stripBOM(/** @type {string} */ str: string)
{
  return str[0] === '\uFEFF' ? str.substring(1) : str;
}

