import tcpPkg from '../tcp_pkg/tcp_pkg.js';
import fs from 'fs'
import cp from 'child_process'

class controller {
    constructor(client) {
        this.type = 0
        this.client = client
        this.client.setEncoding = 'UTF-8';
        this.client.lastPkg = null;
    }
    print(str) {
        console.log(str)
    }
    setName(name) {
        this.name = name
    }
    handleWrite(data) {
        let str = JSON.stringify(data)
        let buf = tcpPkg.packageData(str)
        this.client.write(buf)
    }
    handleMsg() {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        const { msg, name } = this.o.data
        process.stdout.write(`${name}：${msg}\n`)
        process.stdout.write(`\x1b[31m${this.name}：\x1b[0m`);
    }
    handlePerson() {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        const { msg, name } = this.o.data
        process.stdout.write(`\x1B[36m${name} TO U：${msg}\x1B[0m\n`)
        process.stdout.write(`\x1b[31m${this.name}：\x1b[0m`);
    }
    handleExit() {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        const { msg, name } = this.o.data
        process.stdout.write(`${name}：${msg}\n`)
        process.exit()
    }
    handleGet() {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        if (this.o.data.list.length != 0) {
            for (let item of this.o.data.list) {
                process.stdout.write(`\x1B[36m文件：${item}\x1B[0m\n`)
            }
        } else {
            process.stdout.write(`\x1B[36m没有文件\x1B[0m\n`)
        }
        process.stdout.write(`\x1b[31m${this.name}：\x1b[0m`);
    }
    handleFile(isAudio = false) {
        if (isAudio) {
            if (!fs.existsSync('./ClientCache')) {
                fs.mkdirSync('./ClientCache')
            }
            this.type = 3
            this.hasSend = 0;
            this.fileBuf = '';//buffer存储对象
            this.tempAudioName=this.o.fileName;
            this.fd = fs.openSync(`./ClientCache/${this.o.data.fileName}`, 'w+');
        }
        else {
            this.type = 1
            if (!fs.existsSync('./downfile')) {
                fs.mkdirSync('./downfile')
            }
            this.hasSend = 0;
            this.fileBuf = '';//buffer存储对象
            this.fd = fs.openSync(`./downfile/${this.o.data.fileName}`, 'w+');
        }
    }
    handleRaw(data) {
        this.hasSend = this.hasSend + 4096;
        if (this.hasSend >= this.o.data.fileSize) {
            let pack = Buffer.from(data.slice(0, this.o.data.fileSize * 2 % 4096), 'hex');
            fs.appendFileSync(this.fd, pack);
            fs.closeSync(this.fd)
            if (this.type == 3) {
                this.type = 0
                let audioplay=cp.spawnSync(`sox`,['./ClientCache/output.raw','-t','waveaudio'])
            }
            else {
                this.client.destroy()
            }
        } else {
            let pack = Buffer.from(data, 'hex');
            fs.appendFileSync(this.fd, pack);
        }
    }
    handlepreAudio() {
        const data = {
            type: 'getaudio',
            data:{
                fileName:this.o.data.fileName
            }
        }
        let str = JSON.stringify(data)
        let buf = tcpPkg.packageData(str)
        this.client.write(buf)
    }
    handleGateway(str) {
        this.o = JSON.parse(str)
        switch (this.o.type) {
            case 'msg':
                this.handleMsg();
                break;
            case 'msgPerson':
                this.handlePerson();
                break;
            case 'exit':
                this.handleExit()
                break;
            case 'file':
                this.handleFile();
                break;
            case 'audiofile':
                this.handleFile(true);
                break;
            case 'get':
                this.handleGet()
                break;
            case 'preaudio':
                this.handlepreAudio();
                break;
            default:
                this.handleMsg();
                break;
        }
    }
    handlePkg(data) {
        let lastPkg = this.client.lastPkg;
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
            this.client.lastPkg = lastPkg;
            return;
        }
        while (offset + pkgLen <= lastPkg.length) {
            let curBuffer = Buffer.allocUnsafe(pkgLen - 2)
            lastPkg.copy(curBuffer, 0, offset + 2, offset + pkgLen);

            switch (this.type) {
                case 0:
                    this.handleGateway(curBuffer.toString())
                    break;
                case 1:
                    this.handleRaw(curBuffer.toString())
                    break;
                case 3:
                    this.handleRaw(curBuffer.toString())
            }

            offset += pkgLen;
            if (offset >= lastPkg.length) {
                break;
            }
            pkgLen = tcpPkg.readSize(lastPkg, offset)
            if (pkgLen < 0) {
                break;
            }
        }
        if (offset >= lastPkg.length) {
            lastPkg = null;
        } else {
            let buf = Buffer.allocUnsafe(lastPkg.length - offset);
            lastPkg.copy(buf, 0, offset, lastPkg.length);
            lastPkg = buf;
        }

        this.client.lastPkg = lastPkg;
    }
}

export default controller;