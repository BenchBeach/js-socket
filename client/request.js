import net from 'net';
import tcpPkg from '../tcp_pkg/tcp_pkg.js';
import { port, hostname } from './config.js'
import fs from 'fs'
import controller from './controller.js';

class request {
    constructor(ctrl) {
        this.ctrl = ctrl
        this.type = 0
    }
    setName(name) {
        this.name = name
    }
    handleFile(msg) {
        const socket = new net.Socket();

        socket.connect(port, hostname, () => {
            const fileInfo = fs.statSync(msg);
            const fileSize = fileInfo.size;
            const packageSize = 4096;
            let sendSize = 0;
            let strData = JSON.stringify({
                type: 'file',
                data: {
                    fileName: msg.split('/').slice(-1)[0],
                    fileSize
                }
            })
            socket.write(tcpPkg.packageData(strData))
            let fd = fs.openSync(msg, 'r');
            let readBuf = new Buffer.alloc(packageSize);
            while (sendSize < fileSize) {
                fs.readSync(fd, readBuf, 0, readBuf.length, sendSize);
                let Filedata = readBuf.toString('hex');
                socket.write(tcpPkg.packageData(Filedata));
                sendSize += packageSize;
            }
        });

        socket.on('data', (msg) => {
            console.log('what?')
        });

        socket.on('error', error => {
            console.log('error' + error);
        });

        socket.on('close', () => {
            this.ctrl.handleGateway(JSON.stringify({ type: 'msg', data: { name: '文件助手', msg: `文件${msg.split('/').slice(-1)[0]}传输完成` } }))
        });
    }
    handleGet() {
        this.data = {
            type: 'get'
        }
        this.ctrl.handleWrite(this.data)
    }
    handleDownload(toMsg) {
        const socket = new net.Socket();
        let ctrl = new controller(socket)
        socket.connect(port, hostname, () => {
            ctrl.handleWrite({type:'dowmload',data:{fileName:toMsg}})
        });


        socket.on('data', (msg) => {
            ctrl.handlePkg(msg)
        });

        socket.on('error', error => {
            console.log('error' + error);
            process.exit()
        });

        socket.on('close', () => {
            this.ctrl.handleGateway(JSON.stringify({ type: 'msg', data: { name: '文件助手', msg: `文件传输完成` } }))
        });
    }
    Interceptors(msg) {
        let msgPersonReg = /^#.+#/g
        this.data = {}
        if (msgPersonReg.test(msg)) {
            let toName = msg.split('#')[1]
            let toMsg = msg.split('#')[2]
            switch (toName) {
                case 'file':
                    this.handleFile(toMsg.trim())
                    break;
                case 'get':
                    this.handleGet()
                    break;
                case 'download':
                    this.handleDownload(toMsg.trim())
                    break;
                default:
                    this.data = {
                        type: 'msgPerson',
                        data: {
                            toName: toName,
                            msg: toMsg,
                            name: this.name
                        }
                    }
                    this.ctrl.handleWrite(this.data)
            }
        } else {
            this.data = {
                type: 'msg',
                data: {
                    msg,
                    name: this.name
                }
            }
            this.ctrl.handleWrite(this.data)
        }
    }
}

export default request;