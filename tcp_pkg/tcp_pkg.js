let tcpPkg = {
    readSize: (pkgData, offset) => {
        if (offset > pkgData.length - 2) {
            return -1;
        }
        let len = pkgData.readUInt16LE(offset);
        return len;
    },
    packageData: (data) => {
        let data_len = Buffer.from(data).length;
        let buf = Buffer.allocUnsafe(2 + data_len);
        buf.writeInt16LE(2 + data_len, 0);

        buf.fill(data, 2);
        return buf;
    }
}

export default tcpPkg;