import winston from 'winston';
import config from '../config';

let logger: winston.Logger;

if (config.NODE_ENV === 'production') {
  logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(), winston.format.splat(), winston.format.colorize()),
        level: 'info',
        handleExceptions: true,
      }),
      new winston.transports.File({
        level: 'debug',
        handleExceptions: true,
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        filename: `logs/log-${new Date().toISOString().split('T')[0]}.log`,
      }),
    ],
    exitOnError: true,
  });
} else {
  logger = winston.createLogger({
    exitOnError: false,
    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.simple()),
    level: 'debug',
    handleExceptions: true,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(), winston.format.splat(), winston.format.colorize()),
        level: 'debug',
        handleExceptions: true,
      }),
      new winston.transports.Http(),
      new winston.transports.File({
        level: 'debug',
        handleExceptions: true,
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        filename: `logs/log-${new Date().toISOString().split('T')[0]}.log`,
      }),
    ],
  });
}
const logging = () => logger;

export default logging();
