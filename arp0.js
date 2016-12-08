function parse(input) {
  function parsePiece(input) {
    input = input.trim();
    const atomRegex = /^[^\s\[\]]+/
    switch (input[0]) {
    case '[':
      const value = [];
      let piece = parsePiece(input.substr(1));
      while (piece.value !== null) {
        value.push(piece.value);
        piece = parsePiece(piece.remaining)
      }
      return {
        value,
        remaining: piece.remaining
      };
    case ']':
      return {value: null, remaining: input.substr(1)};
    default:
      const result = atomRegex.exec(input);
      if(result == null || result.index !== 0){
        throw new Error("Unknow character at "+input);
      }
      return {
        value: result[0],
        remaining: input.substr(result[0].length)
      };
    }
  }
  const result = parsePiece(input);
  if(result.remaining){
    throw new Error("Unexpeced Charcters "+result.remaining);
  }
  return result.value;
}

export default function arp0(input) {
  const ast = parse(input);
  switch (ast) {
    case 'T!':
      return true;
    case 'F!':
      return false;
    case 'symbol!':
      return symb => symb;
    case 'literal!':
      return function () {
        return [...arguments]
      };
    default:
      if(Array.isArray(ast)){
        return arp0(ast[0]).apply(null, ast.slice(1));
      }
      return null;
  }
}
