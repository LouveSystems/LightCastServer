

class BuffWriter
{
    #position;
    #buffer;

    constructor (buffer)
    {
        this.#position = 0;
        this.#buffer = buffer;        
    }

    getRemainingLength()
    {
        return this.#buffer.length - this.#position;
    }

    writeInt8PrefixedString(str)
    {
        const length = writeInt8(Math.min(255, str.length));

        if (length > this.getRemainingLength())
        {
            const str = this.#buffer.readFixedLengthString(length);
            this.#position += length;
            
            return str;
        }

        throw `Buffer truncated: expected ${length} bytes and got ${this.getRemainingLength()}`;
    }

    writeFixedLengthString(str, length)
    {
        if (length > this.getRemainingLength())
        {
            throw `Cannot write fixed length string because it should be ${length} bytes long and i only got ${this.getRemainingLength()} bytes left`;
        }

        this.#buffer.write(str, this.#position, length, 'utf8');
        this.#position += length;
        this.#buffer.writeInt8(0, this.#position - 1);

        return str;
    }

    writeInt8(val)
    {
        const result = this.#buffer.writeInt8(val, this.#position);
        this.#position++;

        return result;
    }

    writeInt16(val)
    {
        const result = this.#buffer.writeInt16LE(val, this.#position);
        this.#position += 2;

        return result;
    }

    writeUInt16(val)
    {
        const result = this.#buffer.writeUInt16LE(val, this.#position);
        this.#position += 2;

        return result;
    }

    writeInt32(val)
    {
        const result = this.#buffer.writeInt32LE(val, this.#position);
        this.#position += 4;

        return result;
    }

    writeUInt32(val)
    {
        const result = this.#buffer.writeUInt32LE(val, this.#position);
        this.#position += 4;

        return result;
    }
}

module.exports = BuffWriter;