
const { ip2int, int2ip } = require('../utility/ipint');
const BuffReader = require('./buffreader');
const BuffWriter = require('./buffwriter');
const { GAME_NAME_LENGTH, LOBBY_NAME_LENGTH, MAP_NAME_LENGTH } = require('./consts');

const MINIMUM_LOBBY_SUBMISSION_LENGTH = 0
    + 1 // Net type 
    + 2 // Port
    + GAME_NAME_LENGTH 
    + LOBBY_NAME_LENGTH 
    + 1 // PlayerCount
    + 1 // MaxPlayers
    + MAP_NAME_LENGTH
    + 1 // Raw Data Length
;

const MINIMUM_LOBBY_INFORMATION_LENGTH = 
    MINIMUM_LOBBY_SUBMISSION_LENGTH 
    + 4 // IP Address
    - GAME_NAME_LENGTH
;


const networkType =
{
    DELETE: 0,
    ipv4: 1
    // , ipv6: 2
}

class Lobby {

    static GAME_NAME_LENGTH = GAME_NAME_LENGTH;

    getAddress = () => this.#ipAddress;
    getPort = () => this.#port;
    isDeletionRequest = () => this.#net == 0;
    getGameName = () => this.#game;

    lastHeardOf = Date.now();

    #ipAddress; // uint32 or uint128

    #net = networkType.DELETE; // byte
    #port; // ushort
    #game; // string

    // server info
    #name; // byte
    #playerCount; // byte
    #maxPlayers; // byte
    #mapName; // MAP_NAME_LENGTH

    #rawData;

    constructor(buffer, recvinfo) {

        const reader = new BuffReader(buffer);

        this.#net = reader.readInt8();

        if (buffer.length > 0 &&  this.#net == networkType.DELETE)
        {
            // Delete order
            this.#port = reader.readUInt16();
            return;
        }

        if (reader.getRemainingLength() < MINIMUM_LOBBY_SUBMISSION_LENGTH-1)
        {
            throw `Lobby buffer too small: expected ${MINIMUM_LOBBY_SUBMISSION_LENGTH} bytes and got ${buffer.length}`;
        }


        this.#ipAddress = ip2int(recvinfo.address); // autodetermine
        this.#port = reader.readUInt16();

        this.#game = reader.readFixedLengthString(GAME_NAME_LENGTH);
        this.#name = reader.readFixedLengthString(LOBBY_NAME_LENGTH);

        this.#playerCount = reader.readInt8();
        this.#maxPlayers = reader.readInt8();

        this.#mapName = reader.readFixedLengthString(MAP_NAME_LENGTH);

        const rawDataLength = reader.readInt8() * 4;
        this.#rawData = reader.readBuffer(rawDataLength);

        this.lastHeardOf = Date.now();
    }

    toString()
    {
        return `[${this.#game} "${this.#name}" @ ${int2ip(this.#ipAddress)}:${this.#port}]`;
    }

    serialize()
    {
        let buff = Buffer.alloc(MINIMUM_LOBBY_INFORMATION_LENGTH);
        const writer = new BuffWriter(buff);

        writer.writeInt8(this.#net);
        writer.writeUInt32(this.#ipAddress);
        writer.writeUInt16(this.#port);

        writer.writeFixedLengthString(this.#name, LOBBY_NAME_LENGTH);

        writer.writeInt8(this.#playerCount);
        writer.writeInt8(this.#maxPlayers);

        writer.writeFixedLengthString(this.#mapName, MAP_NAME_LENGTH);

        writer.writeInt8(this.#rawData.length);

        if (this.#rawData.length > 0)
        {
            buff = Buffer.concat([buff, this.#rawData]);
        }

        return buff;
    }
}


module.exports = Lobby;
