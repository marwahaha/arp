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
  constructor(base){
    this.bindings = new Map();
    this.base = base || null;
  }
}

class LoopBreak{
  constructor(value){
    this.value = value;
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
    case 'assign!':return (name, param)=> assign(name, param, context);
    case 'let!':
    case 'let-mut!': return (name, param)=>{
      return context.bindings[name] = arp0statement(param, context);
    };
    case 'decide!': return (test, trueClause, falseClause) => {
      const chosenClause = arp0statement(test, context)? trueClause: falseClause;
      return arp0statement(chosenClause, context);
    }
    case 'do!': return function () {
      return arp0run([...arguments], derivedContext(context));
    }
    case 'loop!': return (clause) => {
      try {
        for(;;){
          arp0statement(clause, context);
        }
      } catch (e){
        if(e instanceof LoopBreak) {
          return e.value;
        }
        throw e;
      }
    };
    case 'break!': return (value) => {
      throw new LoopBreak(arp0statement(value, context));
    };
    case 'macro!': return (paramName, clause) => {
      return function(){
        context.bindings[paramName] = [...arguments];
        return arp0statement(clause, context);
      };
    };
    default:
      return getBindedValue(ast, context);
  }
}

function assign(symbol, param, context) {
  if(!context){
    throw new Error("Symbol '"+symbol+"' not found");
  }
  const oldValue = context.bindings[symbol];
  if(typeof oldValue !== 'undefined'){
    return context.bindings[symbol] = arp0statement(param, context);
  } else {
    return assign(symbol, param, context.base);
  }
}

function getBindedValue(symbol, context) {
  if(!context){
    throw new Error("Symbol '"+symbol+"' not found");
  }
  const value = context.bindings[symbol];
  return (typeof value !== 'undefined'
    ? context.bindings[symbol]
    : getBindedValue(symbol, context.base)
  );
}

function derivedContext(context) {
  return new Context(context);
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
