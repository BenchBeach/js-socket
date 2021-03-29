let tcpPkg = {
    readSize: (pkgData, offset)=>{
        if (offset > pkgData.length - 2) {
            return -1;
        }
        let len = pkgData.readUInt32LE(offset);
        return len;
    },
    packageData:  (data)=>{
 
        // 代替data.length即可，否则不支持汉字
        var data_len = Buffer.from(data).length;
 
        //
        var buf = Buffer.allocUnsafe(4 + data_len);
 
        // 可见写入的这个长度包含: 包头 + 包体
        buf.writeInt32BE(4 + data_len, 0);
 
        buf.fill(data, 4);
        return buf;
    }
}
let str=''
let n =100
while(n--){
    str+="123123123"
}
let x = tcpPkg.packageData('123')
console.log(x)
console.log()