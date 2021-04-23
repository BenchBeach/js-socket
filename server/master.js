import os from 'os';
import cp from 'child_process'
import net from 'net'
import {port,hostname} from './config.js'
import readline from 'readline';

const numCPUs=os.cpus().length;

let worker = [];
let socketCnt=0;

for(let i=0;i<numCPUs;i++){
    worker.push(cp.fork('server.js',[i]))
}

const server = new net.createServer({ pauseOnConnect: true });

server.on('connection', (client)=>{
    worker[socketCnt].send('socket',client,{keepOpen:ture});
})

server.listen(port, hostname, () => {
    console.log(`服务器运行在：http://${hostname}:${port}`);
    (function printLogo() {
        console.log("     ______   __    __  __        ______  __    __  ________         ______   __    __   ______   ________ \n    /      \\ /  \\  /  |/  |      /      |/  \\  /  |/        |       /      \\ /  |  /  | /      \\ /        |\n   /$$$$$$  |$$  \\ $$ |$$ |      $$$$$$/ $$  \\ $$ |$$$$$$$$/       /$$$$$$  |$$ |  $$ |/$$$$$$  |$$$$$$$$/ \n   $$ |  $$ |$$$  \\$$ |$$ |        $$ |  $$$  \\$$ |$$ |__          $$ |  $$/ $$ |__$$ |$$ |__$$ |   $$ |   \n   $$ |  $$ |$$$$  $$ |$$ |        $$ |  $$$$  $$ |$$    |         $$ |      $$    $$ |$$    $$ |   $$ |   \n   $$ |  $$ |$$ $$ $$ |$$ |        $$ |  $$ $$ $$ |$$$$$/          $$ |   __ $$$$$$$$ |$$$$$$$$ |   $$ |   \n   $$ \\__$$ |$$ |$$$$ |$$ |_____  _$$ |_ $$ |$$$$ |$$ |_____       $$ \\__/  |$$ |  $$ |$$ |  $$ |   $$ |   \n   $$    $$/ $$ | $$$ |$$       |/ $$   |$$ | $$$ |$$       |      $$    $$/ $$ |  $$ |$$ |  $$ |   $$ |   \n    $$$$$$/  $$/   $$/ $$$$$$$$/ $$$$$$/ $$/   $$/ $$$$$$$$/        $$$$$$/  $$/   $$/ $$/   $$/    $$/    ")
    })()
});

// cli module
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (msg) => {
    if(msg=='q'){
        process.exit();
    }
})