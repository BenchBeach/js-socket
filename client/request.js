import net from 'net';
import {port,hostname} from './config.js'

class request {
    constructor(ctrl) {
        this.ctrl = ctrl
    }
    setName(name) {
        this.name = name
    }
    handleFile(msg){
        
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