import net from 'net';
import tcpPkg from '../tcp_pkg/tcp_pkg.js';
import { port, hostname } from './config.js'
import fs from 'fs'
import controller from './controller.js';
import mic from 'mic';

class request {
    constructor(ctrl) {
        this.ctrl = ctrl
        this.type = 0
    }
    setName(name) {
        this.name = name
    }
    handleFile(msg, isAudio = false) {
        const socket = new net.Socket();

        socket.connect(port, hostname, () => {
            const fileInfo = fs.statSync(msg);
            const fileSize = fileInfo.size;
            const packageSize = 4096;
            let sendSize = 0;
            let strData;
            if (isAudio = true) {
                strData = JSON.stringify({
                    type: 'audio',
                    data: {
                        fileName: msg.split('/').slice(-1)[0],
                        fileSize,
                        name: this.name
                    }
                })
            } else {
                strData = JSON.stringify({
                    type: 'file',
                    data: {
                        fileName: msg.split('/').slice(-1)[0],
                        fileSize
                    }
                })
            }
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
            this.ctrl.handleGateway(JSON.stringify({ type: 'msg', data: { name: '文件助手', msg: `${isAudio ? '语音' : '文件'}${msg.split('/').slice(-1)[0]}传输完成` } }))
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
            ctrl.handleWrite({ type: 'dowmload', data: { fileName: toMsg } })
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
    handleRecord(time = 5) {
        if (!fs.existsSync('./ClientCache')) {
            fs.mkdirSync('./ClientCache')
        }
        //console.log(fs.existsSync("./ClientCache/output.raw"))

        // if (fs.existsSync("./ClientCache/output.raw")) {
        //     fs.unlinkSync("./ClientCache/output.raw")
        //     console.log('rm old')
        // }
        let micInstance = mic({
            rate: '4000',
            channels: '1',
            debug: true,
            exitOnSilence: 6
        });
        let micInputStream = micInstance.getAudioStream();
        let outputFileStream = fs.WriteStream(`./ClientCache/output.raw`);
        outputFileStream.on('error', function (err) {
            console.log(err);
        });
        micInputStream.pipe(outputFileStream);
        micInputStream.on('startComplete', () => {
            console.log("Got SIGNAL startComplete");
            setTimeout(() => {
                micInstance.stop();
                outputFileStream.emit('close');
                this.handleFile(`./ClientCache/output.raw`, true)
            }, time * 1000);
        });
        micInstance.start();
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
                case 'record':
                    this.handleRecord(parseInt(toMsg.trim()))
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