const net = require( 'net' );
const readline = require('readline');
const UUID = require('uuid');

const port = 8848;
const hostname = 'localhost';

let sessions = {};

const server = new net.createServer();

server.on('connection', (client) => {
  client.id= UUID.v1();
  client.name="匿名用户"
  sessions[client.id] = client; 

  client.setEncoding = 'UTF-8';
  client.on('data',msg =>{ 
    console.log(`客户端${client.name}发来一个信息：${msg}`);
    client.write(msg.toString().toUpperCase())
  });

  client.on('error', e => { 
    console.log('client error:' + e);
    client.end();
    delete sessions[client.id];
  });
  client.on( 'close', ()=> {
    delete sessions[client.id];
    console.log(`客户端${ client.name }下线了`);
  });

});

server.listen( port,hostname, ()=> {
  console.log(`服务器运行在：http://${hostname}:${port}`);
});



  let  rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
  });

  rl.on('line',(msg)=>{
    console.log("     ______   __    __  __        ______  __    __  ________         ______   __    __   ______   ________ \n    /      \\ /  \\  /  |/  |      /      |/  \\  /  |/        |       /      \\ /  |  /  | /      \\ /        |\n   /$$$$$$  |$$  \\ $$ |$$ |      $$$$$$/ $$  \\ $$ |$$$$$$$$/       /$$$$$$  |$$ |  $$ |/$$$$$$  |$$$$$$$$/ \n   $$ |  $$ |$$$  \\$$ |$$ |        $$ |  $$$  \\$$ |$$ |__          $$ |  $$/ $$ |__$$ |$$ |__$$ |   $$ |   \n   $$ |  $$ |$$$$  $$ |$$ |        $$ |  $$$$  $$ |$$    |         $$ |      $$    $$ |$$    $$ |   $$ |   \n   $$ |  $$ |$$ $$ $$ |$$ |        $$ |  $$ $$ $$ |$$$$$/          $$ |   __ $$$$$$$$ |$$$$$$$$ |   $$ |   \n   $$ \\__$$ |$$ |$$$$ |$$ |_____  _$$ |_ $$ |$$$$ |$$ |_____       $$ \\__/  |$$ |  $$ |$$ |  $$ |   $$ |   \n   $$    $$/ $$ | $$$ |$$       |/ $$   |$$ | $$$ |$$       |      $$    $$/ $$ |  $$ |$$ |  $$ |   $$ |   \n    $$$$$$/  $$/   $$/ $$$$$$$$/ $$$$$$/ $$/   $$/ $$$$$$$$/        $$$$$$/  $$/   $$/ $$/   $$/    $$/    ")})