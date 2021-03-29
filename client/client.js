import net from 'net';
import tcpPkg from '../tcp_pkg/tcp_pkg.js ';

const socket = new net.Socket();

const port = 8848;

const hostname = 'localhost';

socket.setEncoding = 'UTF-8';

socket.connect(port, hostname, () => {
  let buffer = tcpPkg.packageData('0123456789')
  let b1 = Buffer.allocUnsafe(6)
  let b2 = Buffer.allocUnsafe(6)
  buffer.copy(b1, 0, 6, 12);
  buffer.copy(b2, 0, 0, 6);
  console.log(buffer)
  console.log(b1)
  console.log(b2)
  socket.write(b2)
  socket.write(b1)
  //socket.write(buffer2)
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