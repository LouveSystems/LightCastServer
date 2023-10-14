

class BuffReader
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

    readInt8PrefixedString()
    {
        const length = readInt8();

        if (length > this.getRemainingLength())
        {
            const str = this.#buffer.readFixedLengthString(length);
            this.#position += length;
            
            return str;
        }

        throw `Buffer truncated: expected ${length} bytes and got ${this.getRemainingLength()}`;
    }

    readFixedLengthString(length)
    {
        if (length > this.getRemainingLength())
        {
            throw `Buffer truncated: expected a fixed length string of ${length} bytes but the buffer only has ${this.getRemainingLength()} bytes left`;
        }

        const str = this.#buffer.toString('utf8', this.#position, this.#position + length);
        this.#position += length;

        return str;
    }

    readInt8()
    {
        const result = this.#buffer.readInt8(this.#position);
        this.#position++;

        return result;
    }

    readInt16()
    {
        const result = this.#buffer.readInt16LE(this.#position);
        this.#position += 2;

        return result;
    }

    readUInt16()
    {
        const result = this.#buffer.readUInt16LE(this.#position);
        this.#position += 2;

        return result;
    }

    readInt32()
    {
        const result = this.#buffer.readInt32LE(this.#position);
        this.#position += 4;

        return result;
    }

    readUInt32()
    {
        const result = this.#buffer.readUInt32LE(this.#position);
        this.#position += 4;

        return result;
    }

    readBuffer(length)
    {
        if (length > this.getRemainingLength())
        {
            throw `Buffer truncated: expected a fixed length buffer of ${length} bytes but the buffer only has ${this.getRemainingLength()} bytes left`;
        }

        return this.#buffer.subarray(this.#position, this.#position + length);
    }
}

module.exports = BuffReader;