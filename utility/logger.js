
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOGGING_LEVEL == undefined ? "info" : process.env.LOGGING_LEVEL,
  format: winston.format.cli(),
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});


module.exports = logger;