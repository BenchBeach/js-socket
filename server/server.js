import net from 'net';
import readline from 'readline';
import { v1 as uuid } from 'uuid';
import controller from './controller.js';
import {port,hostname} from './config.js'

let sessions = {};

const server = new net.createServer();

server.on('connection', (client) => {
    client.id = uuid();
    sessions[client.id] =new controller(client);
    sessions[client.id].getSessions(sessions)
    client.on('data', data => {
        //console.log(`客户端${client.name}发来一个信息：${data}`);
        sessions[client.id].handlePkg(data);
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
