import tcpPkg from '../tcp_pkg/tcp_pkg.js';

class controller {
    constructor(client,type=0) {
        /*type
        0:msg
        1:file
        */
        this.type=type
        this.client = client
        this.client.setEncoding = 'UTF-8';
        this.client.lastPkg = null;
        this.client.name = "匿名用户"
    }

    getSessions(sessions) {
        this.sessions = sessions
    }

    handleAll(str) {
        let id;
        let buf=tcpPkg.packageData(str)
        for(id in this.sessions) {
            if(this.o.data.name!=this.sessions[id].client.name)
            this.sessions[id].client.write(buf)
        }
    }
    handlePerson(str){
        let id;
        let buf=tcpPkg.packageData(str)
        for(id in this.sessions) {
            if(this.o.data.toName==this.sessions[id].client.name){
                this.sessions[id].client.write(buf)
                break;
            }
        }
    }
    handleName(){
        let flag=false;
        let id;
        for(id in this.sessions){
            if(this.sessions[id].client.name==this.o.data){
                flag=true
            }
        }
        if(flag){
            let back ={
                type:'exit',
                data:{
                    name:'server',
                    msg:'昵称重复啦'
                }
            }
            this.client.write(tcpPkg.packageData(JSON.stringify(back)))
            this.client.end()
        }else{
            this.client.name=this.o.data
        }
    }
    handleGateway(str) {
        console.log(str)
        this.o = JSON.parse(str)
        // console.log(o)
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
            case 'name':
                this.handleName();
                break
            default:
                this.handleAll();
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

            //#TODO 业务
            this.handleGateway(curBuffer.toString())
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