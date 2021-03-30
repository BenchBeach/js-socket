import net from 'net';
import controller from './controller.js';
import readline from 'readline';

const socket = new net.Socket();

const port = 8848;
const hostname = 'localhost';

let ctrl=new controller(socket)

socket.connect(port, hostname, () => {

});


socket.on('data', (msg) => {
  console.log(msg.toString());
});

socket.on('error', error => {
  console.log('error' + error);
});

socket.on('close', () => {
  console.log('服务器端下线了');
});

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// rl.on('line', (msg) => {
//   let data={
//     type:'msg',
//     data:msg
//   }
//   ctrl.handleWrite(data)
//   process.stdout.write('\x1b[40m \x1b[31m red\x1b[0m\x1b[5m : \x1b[0m ');
// })
console.log('\x1b[3m123123')