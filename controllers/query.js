const Query = require("../types/query");

const protocol = require('../types/protocol')
const logger = require('../utility/logger');

module.exports = function(data, recvinfo, server)
{
    const query = new Query(data);
    
    logger.debug(`Preparing to send a lobby list to client [${recvinfo.address}] for game ${query.game}`);

    const lobbies = server.getLobbies();
    for(let i in lobbies)
    {
        const header = Buffer.alloc(1+4);
        header.writeInt8(protocol.QUERY_RESPONSE);
        header.writeInt32LE(query.id, 1);
        
        server.sendTo(Buffer.concat([ header, lobbies[i].serialize()]), recvinfo);
    }

    logger.info(`Sent ${lobbies.length} lobbies to client ${recvinfo.address} for game ${query.game}`);
}