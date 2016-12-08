export default function (input) {
  function parceList(input) {
    const value = [];
    const spaceRegex = /^\s*/
    let element = parseElement(input);
    while (element.value !== null) {
      value.push(element.value);
      const remaining = element.remaining.substr(element.remaining.match(spaceRegex)[0].length)
      if(remaining === ''){
        break;
      }
      element = parseElement(remaining)
    }
    return {
      value,
      remaining: element.remaining
    };
  }

  function parseElement(input) {
    const atomRegex = /^[^\s\[\]]+/
    switch (input[0]) {
    case '[':
      return parceList(input.substr(1));
    case ']':
      return {value: null, remaining: input.substr(1)};
    default:
      const result = atomRegex.exec(input);
      if(result == null || result.index !== 0){
        throw new Error("Unknow character at '"+input+"'");
      }
      return {
        value: result[0],
        remaining: input.substr(result[0].length)
      };
    }
  }
  const result = parceList(input.trim());
  if(result.remaining){
    throw new Error("Unexpeced Charcters "+result.remaining);
  }
  return result.value;
}
