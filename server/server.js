import net from 'net';
import readline from 'readline';
import { v1 as uuid } from 'uuid';
import controller from './controller.js';

let sessions = {};

process.on('message', (m, client) => {
    if (m === 'socket') {
        if (client) {
            client.id = uuid();
            sessions[client.id] = new controller(client);
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
        }
    }
});
// server.on('connection', (client) => {
//     client.id = uuid();
//     sessions[client.id] =new controller(client);
//     sessions[client.id].getSessions(sessions)
//     client.on('data', data => {
//         //console.log(`客户端${client.name}发来一个信息：${data}`);
//         sessions[client.id].handlePkg(data);
//     });

//     client.on('error', e => {
//         console.log('client error:' + e);
//         client.end();
//         delete sessions[client.id];
//     });
//     client.on('close', () => {
//         delete sessions[client.id];
//         console.log(`客户端${client.name}下线了`);
//     });

// });

