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

  let(symbol, value){
    this.bindings[symbol] = value;
  }

  assign(symbol, value) {
    const oldValue = this.bindings[symbol];
    if(typeof oldValue === 'undefined'){
      if(!this.base){
        throw new Error("Symbol '"+symbol+"' not found");
      }
      return this.base.assign(symbol, value, this.base);
    } else {
      return this.bindings[symbol] = value;
    }
  }
}

class Arp0{
  constructor(context){
    this.context = context = context || new Context();
    this.addMacro('head', (l) => this.evalElement(l)[0]);
    this.addMacro('tail', (l) => this.evalElement(l).slice(1));
    this.addMacro('empty?', (l) => this.evalElement(l).length === 0);
    this.addMacro('node', (h, t) => [this.evalElement(h)].concat(this.evalElement(t)));
    this.addMacro('=', (v1, v2) => (this.evalElement(v1) === this.evalElement(v2)));
  }

  addMacro(name, func){
    this.context.let(name, func);
  }

  evalElement(ast){
    if(Array.isArray(ast)){
      if(ast.length == 0){
        return [];
      }
      const element0 = this.evalElement(ast[0]);
      if(element0 instanceof Function){
        return element0.apply(this, ast.slice(1));
      } else {
        return this.evalElement(element0);
      }
    }
    switch (ast) {
      case 'T!': return true;
      case 'F!': return false;
      case '!':
      case 'literal!': return symb => symb;
      case 'let!':
      case 'let-mut!': return (name, param)=>{
        return this.context.bindings[name] = this.evalElement(param);
      };
      case 'assign!':return (name, param)=> this.context.assign(name, this.evalElement(param));
      case 'decide!': return (test, trueClause, falseClause) => {
        const chosenClause = this.evalElement(test)? trueClause: falseClause;
        return this.evalElement(chosenClause);
      }
      case 'do!': return function () {
        const derived = new Arp0(this.context.createDerived());
        return derived.eval([...arguments]);
      }
      case 'loop!': return (clause) => {
        try {
          for(;;){
            this.evalElement(clause);
          }
        } catch (e){
          if(e instanceof LoopBreak) {
            return e.value;
          }
          throw e;
        }
      };
      case 'break!': return (value) => {
        throw new LoopBreak(this.evalElement(value));
      };
      case 'macro!': return (paramName, clause) => {
        return function(){
          const paramValue = ['!', [...arguments]];
          const derived = new Arp0(this.context.createDerived());
          return derived.evalElement(replaceParams(clause));
          function replaceParams(clause) {
            if(clause===paramName){
              return paramValue;
            }
            if(Array.isArray(clause)){
              return clause.map(replaceParams);
            }
            return clause;
          }
        };
      };
      default:
        return this.context.get(ast);
    }
  }

  eval(ast) {
    return ast.reduce((prev, statement) => {
      return this.evalElement(statement);
    }, null);
  }
}

export {Arp0};

export default function(input) {
  const ast = parse(input);
  const arp = new Arp0();
  return arp.eval(ast);
}
