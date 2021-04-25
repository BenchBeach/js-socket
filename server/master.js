import os from 'os';
import cp from 'child_process'
import net from 'net'
import {port,hostname} from './config.js'
import readline from 'readline';

const numCPUs=os.cpus().length;

let workers = [];
let socketCnt=0;

for(let i=0;i<numCPUs;i++){
    workers.push(cp.fork('./server/server.js',[i]))
}

for(let i=0;i<numCPUs;i++){
    workers[i].on('message',(m)=>{
        for(let index in workers){
            if(index!=i){
                workers[index].send(m)
            }
        }
    })
}
const server = new net.createServer({ pauseOnConnect: true });

server.on('connection', (client)=>{
    workers[socketCnt%numCPUs].send('socket',client,{keepOpen:true});
    socketCnt++
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