import tcpPkg from '../tcp_pkg/tcp_pkg.js';

class controller {
    constructor(client) {
        this.client = client
        this.client.setEncoding = 'UTF-8';
        this.client.lastPkg = null;
    }
    print(str){
        console.log(str)
    }

    handleWrite(data){
        let str=JSON.stringify(data)
        let buf = tcpPkg.packageData(str)
        this.client.write(buf)
    }

    handleGateway(str) {
        this.o = JSON.parse(str)
        console.log(o)
        // switch (o.type) {
        //     case 'msgAll':
        //         this.handleAll();
        //         break;
        //     case 'msgPerson':
        //         this.handlePerson();
        //         break;
        //     case 'file':
        //         this.handleFile();
        //         break;
        //     default:
        //         this.handleAll();
        //         break;
        // }
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
            this.handleGateway(curBuffer.toString())
            console.log(curBuffer.toString())

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