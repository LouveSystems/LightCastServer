const { ip2int, int2ip } = require('../utility/ipint');

const Lobby = require("../types/lobby");

const protocol = require('../types/protocol')
const logger = require('../utility/logger');

module.exports = function(data, recvinfo, server)
{
    // unused for now
    const version = data.readInt8();
    const lobby = new Lobby(data.subarray(1), recvinfo);

    const del = lobby.isDeletionRequest();
    
    if (del)
    {
        logger.debug(`Deleting lobby for address ${recvinfo.address} on server`);
        server.removeLobbyOfClient(ip2int(recvinfo.address), lobby.getPort());
    }
    else
    {
        logger.debug(`Preparing to add lobby ${lobby.toString()} to the lobby list on server`);
        server.addLobby(lobby);
    }
}