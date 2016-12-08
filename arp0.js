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

  get(symbol) {
    const value = this.bindings[symbol];
    if(typeof value === 'undefined'){
      if(!this.base){
        throw new Error("Symbol '"+symbol+"' not found");
      }
      return this.base.get(symbol);
    }
    return value;
  }


  assign(symbol, param) {
    const oldValue = this.bindings[symbol];
    if(typeof oldValue === 'undefined'){
      if(!this.base){
        throw new Error("Symbol '"+symbol+"' not found");
      }
      return this.base.assign(symbol, param, this.base);
    } else {
      return this.bindings[symbol] = param;
    }
  }
}

class Arp0{
  constructor(context){
    this.context = context = context || new Context();
  }

  evalElement(ast){
    if(Array.isArray(ast)){
      return this.evalElement(ast[0], context).apply(this, ast.slice(1));
    }
    switch (ast) {
      case 'T!': return true;
      case 'F!': return false;
      case 'symbol!': return symb => symb;
      case 'literal!': return function () {
        return [...arguments]
      };
      case 'let!':
      case 'let-mut!': return (name, param)=>{
        return this.context.bindings[name] = this.evalElement(param);
      };
      case 'assign!':return (name, param)=> this.context.assign(name, this.evalElement(param));
      case 'decide!': return (test, trueClause, falseClause) => {
        const chosenClause = this.evalElement(test, context)? trueClause: falseClause;
        return this.evalElement(chosenClause, context);
      }
      case 'do!': return function () {
        const derived = new Arp0(this.context.createDerived());
        return derived.eval([...arguments]);
      }
      case 'loop!': return (clause) => {
        try {
          for(;;){
            this.evalElement(clause, context);
          }
        } catch (e){
          if(e instanceof LoopBreak) {
            return e.value;
          }
          throw e;
        }
      };
      case 'break!': return (value) => {
        throw new LoopBreak(this.evalElement(value, context));
      };
      case 'macro!': return (paramName, clause) => {
        return function(){
          const derived = new Arp0(this.context.createDerived());
          derived.context.bindings[paramName] = [...arguments];
          return derived.evalElement(clause, context);
        };
      };
      default:
        return this.context.get(ast);
    }
  }

  eval(ast, context) {
    return ast.reduce((prev, statement) => {
      return this.evalElement(statement);
    }, null);
  }
}

export default function(input) {
  const ast = parse(input);
  const arp = new Arp0();
  return arp.eval(ast);
}
