import tcpPkg from '../tcp_pkg/tcp_pkg.js';
import fs from 'fs'

class controller {
    constructor(client, type = 0) {
        /*type
        0:msg
        1:upfile
        2:downfile
        */
        this.type = type
        this.client = client
        this.client.setEncoding = 'UTF-8';
        this.client.lastPkg = null;
        this.client.name = "匿名用户"
    }

    getSessions(sessions) {
        this.sessions = sessions
    }

    handleGateway(str) {
        console.log(str)
        this.o = JSON.parse(str)
        switch (this.o.type) {
            case 'msg':
                this.handleAll(str);
                break;
            case 'msgPerson':
                this.handlePerson(str);
                break;
            case 'file':
                this.handleFile();
                break;
            case 'dowmload':
                this.handleDownload();
                break;
            case 'name':
                this.handleName();
                break
            case 'get':
                this.handleGetlist();
                break
            default:
                this.handleAll();
                break;
        }
    }
    handleGetlist(){
        let back;
        if (fs.existsSync('./file')) {
            const list=fs.readdirSync('./file')
            back = {
                type: 'get',
                data: {
                    list
                }
            }
        }else{
            back = {
                type: 'get',
                data: {
                    list:[]
                }
            }
        }
        console.log(back)
        this.client.write(tcpPkg.packageData(JSON.stringify(back)))
    }
    handleAll(str) {
        let id;
        let buf = tcpPkg.packageData(str)
        for (id in this.sessions) {
            if (this.o.data.name != this.sessions[id].client.name)
                this.sessions[id].client.write(buf)
        }
    }

    handlePerson(str) {
        let id;
        let buf = tcpPkg.packageData(str)
        for (id in this.sessions) {
            if (this.o.data.toName == this.sessions[id].client.name) {
                this.sessions[id].client.write(buf)
                break;
            }
        }
    }
    handleName() {
        let flag = false;
        let id;
        for (id in this.sessions) {
            if (this.sessions[id].client.name == this.o.data) {
                flag = true
            }
        }
        if (flag) {
            let back = {
                type: 'exit',
                data: {
                    name: 'server',
                    msg: '昵称重复啦'
                }
            }
            this.client.write(tcpPkg.packageData(JSON.stringify(back)))
            this.client.end()
        } else {
            this.client.name = this.o.data
        }
    }

    handleFile() {
        this.type = 1
        this.client.name = "文件传输"
        if (!fs.existsSync('./file')) {
            fs.mkdirSync('./file')
        }
        this.hasSend = 0;
        this.fileBuf = '';//buffer存储对象
        this.fd = fs.openSync(`./file/${this.o.data.fileName}`, 'w+');
    }

    handleDownload(){
        this.type = 2
        this.client.name = "文件下载"
        const fileInfo = fs.statSync(`./file/${this.o.data.fileName}`);
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
            this.client.write(tcpPkg.packageData(strData))
            let fd = fs.openSync(`./file/${this.o.data.fileName}`, 'r');
            let readBuf = new Buffer.alloc(packageSize);
            while (sendSize < fileSize) {
                fs.readSync(fd, readBuf, 0, readBuf.length, sendSize);
                let Filedata = readBuf.toString('hex');
                this.client.write(tcpPkg.packageData(Filedata));
                sendSize += packageSize;
            }
    }
    handleRaw(data) {
        this.hasSend = this.hasSend + 4096;
        if (this.hasSend >= this.o.data.fileSize * 2) {
            let pack = Buffer.from(data.slice(0, this.o.data.fileSize * 2 % 4096), 'hex');
            fs.appendFileSync(this.fd, pack);
            fs.close(this.fd)
            this.client.end()
        } else {
            let pack = Buffer.from(data, 'hex');
            fs.appendFileSync(this.fd, pack);
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

            //#TODO 业务
            switch (this.type) {
                case 0:
                    this.handleGateway(curBuffer.toString())
                    break;
                case 1:
                    this.handleRaw(curBuffer.toString())
            }
            // console.log(curBuffer.toString())

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