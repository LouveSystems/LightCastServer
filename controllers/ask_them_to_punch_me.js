const { int2ip, ip2int } = require('../utility/ipint');

const protocol = require('../types/protocol')
const logger = require('../utility/logger');
const BuffReader = require('../types/buffreader');
const { GAME_NAME_LENGTH } = require('../types/consts');

module.exports = function(data, recvinfo, server)
{
    const buff = new BuffReader(data);

    // for later use
    const lightcastVersion = buff.readInt8();
    
    const intIP = buff.readUInt32();
    const address = int2ip(intIP);
    const port = buff.readUInt16();
    const gameName = buff.readFixedLengthString(GAME_NAME_LENGTH)
    
    logger.debug(`Client [${recvinfo.address}] asked to be punched by lobby ${address}:${port}`);

    const lobby = server.getLobby(intIP, port);
    if (lobby)
    {
        if (lobby.getGameName() == gameName)
        {
            const header = Buffer.alloc(1+6);
            header.writeInt8(protocol.PUNCH_THEM);
            header.writeUInt32LE(ip2int(recvinfo.address), 1);
            header.writeUInt16LE(recvinfo.port, 4 + 1);
            
            server.sendTo(Buffer.concat([ header, lobbies[i].serialize()]), recvinfo);
            logger.info(`Asked ${address}:${port} on ${gameName} to punch ${recvinfo.address}`);
        }
        else
        {
            logger.warn(`Could not find the lobby (${address}:${port} - wrong game name, expected ${lobby.getGameName()} and got ${gameName}) that ${recvinfo.address} is talking about.`)
        }
    }
    else
    {
        logger.warn(`Could not find the lobby (${address}:${port} that ${recvinfo.address} is talking about.`)
    }
}