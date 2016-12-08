function parse(input) {
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


class Context {
  constructor(){
    this.bindings = new Map();
  }
}

function arp0statement(ast, context) {
  context = context || new Context();
  if(Array.isArray(ast)){
    return arp0statement(ast[0], context).apply(null, ast.slice(1));
  }
  switch (ast) {
    case 'T!': return true;
    case 'F!': return false;
    case 'symbol!': return symb => symb;
    case 'literal!': return function () {
      return [...arguments]
    };
    case 'let!': return (name, param)=>{
      return context.bindings[name] = arp0statement(param, context);
    };
    default:
      return context.bindings[ast];
  }
}

function arp0run(ast, context) {
  context = context || new Context;
  return ast.reduce((prev, statement) => {
    return arp0statement(statement, context);
  }, null);
}

export default function(input) {
  const ast = parse(input);
  return arp0run(ast);
}
