import net from 'net';
import tcpPkg from '../tcp_pkg/tcp_pkg.js';
import {port,hostname} from './config.js'

class request {
    constructor(ctrl) {
        this.ctrl = ctrl
    }
    setName(name) {
        this.name = name
    }
    handleFile(msg){
        const socket = new net.Socket();
        let data = {
            type:'file',
            data:{
                fileName:msg
            }
        }
        socket.connect(port, hostname, (client) => {
            let str=JSON.stringify(data)
            let buf = tcpPkg.packageData(str)
            socket.write(buf)
        });
        
        socket.on('data', (msg) => {
            console('what?')
        });
        
        socket.on('error', error => {
            console.log('error' + error);
        });
        
        socket.on('close', () => {
            console.log('文件传输完成');
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