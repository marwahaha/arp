import {Arp0} from '../arp0js/arp0';
import parser from '../arp0js/parser';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'arp> '
});

let arp = new Arp0();
console.log("Welcome to the arp-cli. Type .help for help");
rl.prompt();
rl.on('line', (line)=>{
  switch (line) {
    case '.help':
      console.log("Type a statement or .exit to quit");
      break;
    case '.exit':
      rl.close();
      break;
    default:
      try{
        console.log(arp.eval(parser(line)));
      } catch(e){
        console.log(e);
      }
  }
  rl.prompt();
}).on('close', () => {
  process.exit(0);
});
