import parse from './parser';

class LoopBreak{
  constructor(value){
    this.value = value;
  }
}

class Context {
  constructor(base){
    this.bindings = new Map();
    this.base = base || null;
  }

  createDerived() {
    return new Context(this);
  }
}

function arp0evalElement(ast, context) {
  context = context || new Context();
  if(Array.isArray(ast)){
    return arp0evalElement(ast[0], context).apply(null, ast.slice(1));
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
      return context.bindings[name] = arp0evalElement(param, context);
    };
    case 'decide!': return (test, trueClause, falseClause) => {
      const chosenClause = arp0evalElement(test, context)? trueClause: falseClause;
      return arp0evalElement(chosenClause, context);
    }
    case 'do!': return function () {
      return arp0eval([...arguments], context.createDerived());
    }
    case 'loop!': return (clause) => {
      try {
        for(;;){
          arp0evalElement(clause, context);
        }
      } catch (e){
        if(e instanceof LoopBreak) {
          return e.value;
        }
        throw e;
      }
    };
    case 'break!': return (value) => {
      throw new LoopBreak(arp0evalElement(value, context));
    };
    case 'macro!': return (paramName, clause) => {
      return function(){
        context.bindings[paramName] = [...arguments];
        return arp0evalElement(clause, context);
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
    return context.bindings[symbol] = arp0evalElement(param, context);
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

function arp0eval(ast, context) {
  context = context || new Context;
  return ast.reduce((prev, statement) => {
    return arp0evalElement(statement, context);
  }, null);
}

export default function(input) {
  const ast = parse(input);
  return arp0eval(ast);
}
