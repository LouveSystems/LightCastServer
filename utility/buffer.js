module.exports = {
    readString: function(buff, offset=0)
    {
        const strLength = buff[offset];
        offset++;
        const result = buff.subarray(offset, offset + strLength).toString('utf8');

        return result;
    }
}