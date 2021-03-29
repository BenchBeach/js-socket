const net = require('net');

const socket = new net.Socket();

const port = 8848;

const hostname = 'localhost';

socket.setEncoding = 'UTF-8';

socket.connect( port,hostname,()=>{
  socket.write('asdfasdf');
  socket.write('asdfasdf');
});


socket.on( 'data',  ( msg )=> {
  console.log( msg.toString() );
});

socket.on( 'error',  error => {
  console.log( 'error' + error );
});

socket.on('close',()=>{
  console.log('服务器端下线了');
});