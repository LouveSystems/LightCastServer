const LOBBY_TIMEOUT_SECONDS = 5;

const logger = require('./utility/logger');

const dgram = require('node:dgram');

class Server {

    getLobbyCount = () => this.#lobbies.length;
    getLobbies = () => [...this.#lobbies];

    #lobbies = [];
    #lobbyMap = {};
    #controllers;
    #server;

    constructor(controllers, options, port) {
        this.#controllers = controllers;

        const server = dgram.createSocket(options,
            (msg, rinfo) => {
                this.#onReceivedData(msg, rinfo);
            }
        );

        server.on('error', (err) => {
            logger.error(err);
            throw err;
        });

        // Print monitoring message every 30 seconds
        setInterval(monitorLobbies, 30 * 1000, this);
        setInterval(this.#frame, 100, this);

        function monitorLobbies(self) {
            logger.info(`Serving ${self.getLobbyCount()} lobbies at the time`);
        }

        this.#server = server;

        logger.info(`Creating lightcast server on port ${port}`);
        server.bind(port);

    }

    sendTo(buff, endpoint) {
        const outOfBandBuff = Buffer.concat([Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]), buff]);

        this.#server.send(outOfBandBuff, 0, outOfBandBuff.length, endpoint.port, endpoint.address, () => {
            logger.debug(`Successfully sent ${outOfBandBuff.length} bytes to ${endpoint.address}:${endpoint.port}`);
        });
    }

    addLobby(lobby) {
        const addr = lobby.getAddress();
        const port = lobby.getPort();

        if (this.#lobbyMap[addr] && this.#lobbyMap[addr][port]) {
            const existingLobby = this.#lobbyMap[addr][port];
            const index = this.#lobbies.indexOf(existingLobby);

            if (index >= 0)
            {
                lobby.lastHeardOf = Date.now();
                this.#lobbies[index] = lobby;
                this.#lobbyMap[addr][port] = lobby;

                logger.debug(`Updated lobby ${lobby.toString()}`);
            }
            else
            {
                logger.error(`Discredepency between lobby map and lobby list? This is actually a huge error!`);
            }

            return;
        }

        this.#lobbies.push(lobby);
        logger.info(`Added lobby ${lobby.toString()}`);

        if (!this.#lobbyMap[addr]) {
            this.#lobbyMap[addr] = {};
        }

        this.#lobbyMap[addr][port] = lobby;
    }

    removeLobbyOfClient(address, port) {
        if (this.#lobbyMap[address]) {
            if (this.#lobbyMap[address][port]) {
                const lobby = this.#lobbyMap[address][port];
                this.removeLobby(lobby);
            }
        }
    }

    removeLobby(lobby) {
        const index = this.#lobbies.indexOf(lobby);
        if (index >= 0) {
            logger.debug(`Removing lobby ${lobby.toString()}`);

            delete this.#lobbies[index];
            this.#lobbies.splice(index, 1);

            const addr = lobby.getAddress();
            const port = lobby.getPort();
            if (this.#lobbyMap[addr]) {
                if (this.#lobbyMap[addr][port]) {
                    delete this.#lobbyMap[addr][port];
                }
            }

            logger.info(`Removed lobby ${lobby.toString()}`);
        }
    }

    #frame(self) {
        const lobbiesToRemove = [];
        for (let i in self.#lobbies) {
            const lastHeardMsAgo = Date.now() - self.#lobbies[i].lastHeardOf;
            if (lastHeardMsAgo > LOBBY_TIMEOUT_SECONDS * 1000) {
                logger.info(`Last heard of server ${self.#lobbies[i].toString()} about ${lastHeardMsAgo}ms ago, timed out, removing it.`);
                lobbiesToRemove.push(self.#lobbies[i]);
            }
        }

        for (let i in lobbiesToRemove) {
            self.removeLobby(lobbiesToRemove[i]);
        }
    }

    #onReceivedData(data, recvinfo) {

        logger.debug(`Received ${data.length} bytes of data from address ${recvinfo.address}`)

        if (data.length <= 1) {
            logger.warn(`Empty message from ${recvinfo.address}`);
            return;
        }

        const controller = data.readInt8();

        if (this.#controllers[controller]) {
            logger.debug(`Answering [${controller}] from ${recvinfo.address}`)
            try {
                this.#controllers[controller](data.length > 1 ? data.slice(1) : Buffer.from(""), recvinfo, this);
            }
            catch (e) {
                logger.error(e);
                throw e;
            }
        }
        else {
            logger.warn(`Unknown controller ${controller} called by client ${recvinfo.address} (protocol violation!)`);
        }
    }
}

module.exports = Server;
