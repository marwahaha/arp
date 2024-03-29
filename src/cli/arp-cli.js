import {Arp0} from '../arp0js/arp0';
import parser from '../arp0js/parser';
import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'arp> '
});

let arp = new Arp0();
arp.addMacro('import', function(f) {
  const content = fs.readFileSync(arp.evalElement(f).join('/'), {'encoding': 'utf8'});
  return arp.eval(parser(content));
});

arp.addMacro('.help', () => "Type a statement or [.exit] to quit" );
arp.addMacro('.exit', () => rl.close());

console.log("Welcome to the arp-cli. Type [.help] for help");
rl.prompt();
rl.on('line', (line)=>{
  try{
    console.log(arp.eval(parser(line)));
  } catch(e){
    console.log(e);
  }
  rl.prompt();
}).on('close', () => {
  process.exit(0);
});
