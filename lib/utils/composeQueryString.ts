/**
 * Converts an object into a valid URI query string
 * @param { object } data - An object whose key-value pairs
 * will be converted into a URI string
 *
 * @return { string } A HTTP query string starting with the
 * question mark (?).
 */
export default (data: object = {}): string => {
  let result = '?';

  for (let key in data) {
    let { value } = Object.getOwnPropertyDescriptor(data, key)!;
    value = `${value}`.split(' ').join('+');
    result += `${key}=${encodeURIComponent(value)}&`;
  }

  // remove trailing `&`
  result = result.slice(0, result.length - 1);

  return result;
};
