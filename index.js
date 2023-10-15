
const logger = require('./utility/logger');

const Server = require('./server');
const protocol = require('./types/protocol')

const VERSION = 8;
const PORT = 4888;

const CONTROLLERS = {};
CONTROLLERS[protocol.QUERY] = require("./controllers/query");
CONTROLLERS[protocol.SUBMIT] = require("./controllers/submit");
CONTROLLERS[protocol.ASK_THEM_TO_PUNCH_ME] = require("./controllers/ask_them_to_punch_me");

logger.info(`Initializing lightcast version ${VERSION}...`);

logger.info(`\n\n┓ •  ┓  ┏┓    \n┃ ┓┏┓┣┓╋┃ ┏┓┏╋\n┗┛┗┗┫┛┗┗┗┛┗┻┛┗\n    ┛         \n`);

// Main()
{
    // CreateServer()
    {
        const options = {type: "udp4"};

        // Listens
        new Server(CONTROLLERS, options, PORT);
    }
}