const Lobby = require("./lobby")

class Query {

    lightcastVersion;
    game = "";
    id = 0;

    constructor(buffer) {
        let offset = 0;

        this.lightcastVersion = buffer.readInt8(offset);
        offset++;

        this.id = buffer.readInt32LE(offset);
        offset += 4;

        this.game = buffer.toString('utf8',  0, Lobby.GAME_NAME_LENGTH);
        offset += this.game.length;
    }
}


module.exports = Query;
