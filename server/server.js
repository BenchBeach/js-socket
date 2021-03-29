import net from 'net';
import readline from 'readline';
import { v1 as uuid } from 'uuid';
import tcpPkg from '../tcp_pkg/tcp_pkg.js ';

const port = 8848;
const hostname = 'localhost';

let sessions = {};

const server = new net.createServer();

server.on('connection', (client) => {
    client.id = uuid();
    client.name = "匿名用户"
    client[client.id] = client;

    client.setEncoding = 'UTF-8';
    client.lastPkg = null;

    client.on('data', data => {
        //console.log(`客户端${client.name}发来一个信息：${data}`);
        let lastPkg = client.lastPkg;
        if (lastPkg) {
            let buf = Buffer.concat([lastPkg, data], lastPkg.length + data.length)
            lastPkg = buf
        } else {
            lastPkg = data
        }
        
        let offset = 0;
        let pkgLen = tcpPkg.readSize(lastPkg, offset);
       
        if (pkgLen < 0) {
            console.error("client 不是完整包！！！");
            client.lastPkg = lastPkg;
            return;
        }
        //console.log(`${offset}：${lastPkg}:${pkgLen}`)
        while (offset + pkgLen <= lastPkg.length) {
            //console.log('in')
            let curBuffer = Buffer.allocUnsafe(pkgLen - 2)
            lastPkg.copy(curBuffer, 0, offset + 2, offset + pkgLen);
            //#TODO 业务
            console.log(curBuffer.toString())
            offset += pkgLen;
            if (offset >= lastPkg.length) {
                break;
            }
            pkgLen=tcpPkg.readSize(lastPkg,offset)
            if(pkgLen < 0){
                break;
            }
        }
        if(offset >= lastPkg.length){
            lastPkg = null;
        }else {
            let buf = Buffer.allocUnsafe(lastPkg.length - offset);
            lastPkg.copy(buf, 0, offset, lastPkg.length);
            lastPkg = buf;
        }
 
        client.lastPkg = lastPkg;
    });

    client.on('error', e => {
        console.log('client error:' + e);
        client.end();
        delete sessions[client.id];
    });
    client.on('close', () => {
        delete sessions[client.id];
        console.log(`客户端${client.name}下线了`);
    });

});

server.listen(port, hostname, () => {
    console.log(`服务器运行在：http://${hostname}:${port}`);
    (function printLogo() {
        console.log("     ______   __    __  __        ______  __    __  ________         ______   __    __   ______   ________ \n    /      \\ /  \\  /  |/  |      /      |/  \\  /  |/        |       /      \\ /  |  /  | /      \\ /        |\n   /$$$$$$  |$$  \\ $$ |$$ |      $$$$$$/ $$  \\ $$ |$$$$$$$$/       /$$$$$$  |$$ |  $$ |/$$$$$$  |$$$$$$$$/ \n   $$ |  $$ |$$$  \\$$ |$$ |        $$ |  $$$  \\$$ |$$ |__          $$ |  $$/ $$ |__$$ |$$ |__$$ |   $$ |   \n   $$ |  $$ |$$$$  $$ |$$ |        $$ |  $$$$  $$ |$$    |         $$ |      $$    $$ |$$    $$ |   $$ |   \n   $$ |  $$ |$$ $$ $$ |$$ |        $$ |  $$ $$ $$ |$$$$$/          $$ |   __ $$$$$$$$ |$$$$$$$$ |   $$ |   \n   $$ \\__$$ |$$ |$$$$ |$$ |_____  _$$ |_ $$ |$$$$ |$$ |_____       $$ \\__/  |$$ |  $$ |$$ |  $$ |   $$ |   \n   $$    $$/ $$ | $$$ |$$       |/ $$   |$$ | $$$ |$$       |      $$    $$/ $$ |  $$ |$$ |  $$ |   $$ |   \n    $$$$$$/  $$/   $$/ $$$$$$$$/ $$$$$$/ $$/   $$/ $$$$$$$$/        $$$$$$/  $$/   $$/ $$/   $$/    $$/    ")
    })()
});


let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (msg) => {
    console.log(msg + 123)
})
