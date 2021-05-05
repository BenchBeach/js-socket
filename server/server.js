import tcpPkg from '../tcp_pkg/tcp_pkg.js';
import {
    v1 as uuid
} from 'uuid';
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
    } else {
        const {type,data}=JSON.parse(m);
        // console.log(type,"121113",data)
        let buf
        switch (type) {
            case 'all':
                buf = tcpPkg.packageData(data)
                for (let id in sessions) {
                    sessions[id].client.write(buf)
                }
                break;
                case 'msgPerson':
                    buf = tcpPkg.packageData(data)
                    for (let id in sessions) {
                        if (JSON.parse(data).data.toName == sessions[id].client.name) {
                            sessions[id].client.write(buf)
                            break;
                        }
                    }
                case 'preaudio':
                    buf = tcpPkg.packageData(JSON.stringify({type,data:{fileName:data.split('/').slice(-1)[0]}}))
                    console.log(JSON.stringify({type,data:{fileName:data}}))
                    for (let id in sessions) {
                            sessions[id].client.write(buf)
                    }
                    break;
                default:break;
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