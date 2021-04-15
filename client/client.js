import net from 'net';
import controller from './controller.js';
import readline from 'readline';
import request from './request.js';
import {port,hostname} from './config.js'

const socket = new net.Socket();


let name=''
let ctrl = new controller(socket)
let req=new request(ctrl)
socket.connect(port, hostname, () => {
});


socket.on('data', (msg) => {
    ctrl.handlePkg(msg)
});

socket.on('error', error => {
    console.log('error' + error);
    process.exit()
});

socket.on('close', () => {
    console.log('服务器端下线了');
    process.exit()
});

//bind input output stream
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


// ASCII ART !!!!!!!!!!!
(function printLogo() {
    console.log("     ______   __    __  __        ______  __    __  ________         ______   __    __   ______   ________ \n    /      \\ /  \\  /  |/  |      /      |/  \\  /  |/        |       /      \\ /  |  /  | /      \\ /        |\n   /$$$$$$  |$$  \\ $$ |$$ |      $$$$$$/ $$  \\ $$ |$$$$$$$$/       /$$$$$$  |$$ |  $$ |/$$$$$$  |$$$$$$$$/ \n   $$ |  $$ |$$$  \\$$ |$$ |        $$ |  $$$  \\$$ |$$ |__          $$ |  $$/ $$ |__$$ |$$ |__$$ |   $$ |   \n   $$ |  $$ |$$$$  $$ |$$ |        $$ |  $$$$  $$ |$$    |         $$ |      $$    $$ |$$    $$ |   $$ |   \n   $$ |  $$ |$$ $$ $$ |$$ |        $$ |  $$ $$ $$ |$$$$$/          $$ |   __ $$$$$$$$ |$$$$$$$$ |   $$ |   \n   $$ \\__$$ |$$ |$$$$ |$$ |_____  _$$ |_ $$ |$$$$ |$$ |_____       $$ \\__/  |$$ |  $$ |$$ |  $$ |   $$ |   \n   $$    $$/ $$ | $$$ |$$       |/ $$   |$$ | $$$ |$$       |      $$    $$/ $$ |  $$ |$$ |  $$ |   $$ |   \n    $$$$$$/  $$/   $$/ $$$$$$$$/ $$$$$$/ $$/   $$/ $$$$$$$$/        $$$$$$/  $$/   $$/ $$/   $$/    $$/    ")
})()

process.stdout.write(`\n\n\n\x1b[31m欢迎来到聊天室！\x1b[0m\n`);

rl.question('\n\x1b[31m请输入你进入聊天室的昵称：\x1b[0m', (ans) => {
    let data = {
        type: 'name',
        data: ans
    }
    name=ans
    ctrl.handleWrite(data)
    ctrl.setName(ans)
    req.setName(ans)
    process.stdout.write(`\x1b[31m开始聊天吧\n${name}：\x1b[0m`);
});

rl.on('line', (msg) => {
    if(msg=='q'){
        process.exit();
    }
    req.Interceptors(msg)
    process.stdout.clearLine();
    process.stdout.cursorTo(0,100);
    process.stdout.write(`\x1b[31m${name}：\x1b[0m`);
})