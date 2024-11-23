/* eslint-disable import/first */
// require('module-alias/register');

// import '../pre-start' // Must be the first import
// organize-imports-disable-below
import config from '@config/index';
import http from 'http';
import process from 'process';
import util from 'util';
import logger from './utils/logger';
import app from './app';
import { Rabbit } from './rabbitmq/rabbit.server';

const port = config.PORT;
app.set('port', port);

const server = http.createServer(app);

Rabbit.getInstance();

const onError = (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  logger.info(`⚡ Listening on ${bind}`);
};

process.on('uncaughtExceptionMonitor', (error: Error, origin: string) => {
  logger.error(`Caught exception:\n${util.format(error)}`);
  logger.error(`Origin: ${origin}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.warn(`Unhandled Rejection at:\n${util.format(promise)}`);
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
