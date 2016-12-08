function statement(input) {
  return ['symbol!', 'SYMB'];
}

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

export default function(input) {
  const ast = parse(input);
  switch (ast) {
    case 'T!':
      return true;
    case 'F!':
      return false;
    default:
      if(Array.isArray(ast)){
        return ast[1];
      }
      return () => {};
  }
}
