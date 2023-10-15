const { int2ip, ip2int } = require('../utility/ipint');

const protocol = require('../types/protocol')
const logger = require('../utility/logger');
const BuffReader = require('../types/buffreader');
const { GAME_NAME_LENGTH } = require('../types/consts');

module.exports = function(data, recvinfo, server)
{
    const buff = new BuffReader(data);
    
    const address = int2ip(buff.readUInt32());
    const port = buff.readUInt16();
    const gameName = buff.readFixedLengthString(GAME_NAME_LENGTH)
    
    logger.debug(`Client [${recvinfo.address}] asked to be punched by lobby ${address}:${port}`);

    const lobby = server.getLobby(address, port);
    if (lobby.gameName == gameName)
    {
        const header = Buffer.alloc(1+6);
        header.writeInt8(protocol.PUNCH_THEM);
        header.writeInt32LE(ip2int(recvinfo.address), 1);
        header.writeInt16LE(recvinfo.port, 4 + 1);
        
        server.sendTo(Buffer.concat([ header, lobbies[i].serialize()]), recvinfo);
        logger.info(`Asked ${address}:${port} on ${gameName} to punch ${recvinfo.address}`);
    }
    else
    {
        logger.warn(`Could not find the lobby (${address}:${port} on ${gameName}) that ${recvinfo.address} is talking about.`)
    }
}