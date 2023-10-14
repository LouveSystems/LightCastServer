
const logger = require('../utility/logger');

class Client {
    #id;
    #socket;

    getId = () => this.#id;

    constructor(id, socket) {
        this.#id = id;
        this.#socket = socket;
    }

    write(buffer)
    {
        const sizeBuffer = Buffer.alloc(4);
        sizeBuffer.writeInt32LE(buffer.length);
        const completeBuffer = Buffer.concat([sizeBuffer, buffer]);
        this.#socket.write(completeBuffer);
        logger.debug(`Wrote ${completeBuffer.length} bytes (${sizeBuffer.length} + ${buffer.length}) of data to client ${this.#id}`);
        console.log(completeBuffer.toString('hex'));
    }

    destroySocket()
    {
        this.#socket.destroy();
    }
}


module.exports = Client;
