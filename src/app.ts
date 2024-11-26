import compression from 'compression';
import express from 'express';
import { middleware } from 'express-openapi-validator';
import { errorLogger, logger } from 'express-winston';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cors from 'cors';
import config from './config';
import handle from './config/errors/error-handler';
import router from './routes';
import logging from './utils/logger';
import DatabaseConnection from '@config/delivery-db';

const app = express();

app.set('trust proxy', 1);
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// Use logging
app.use(
  logger({
    winstonInstance: logging,
    expressFormat: true,
    colorize: true,
    meta: false,
  })
);

DatabaseConnection.getInstance();

// API routes prefix
app.use('/v1', router);

app.use(
  errorLogger({
    winstonInstance: logging,
  })
);

// Use error handlers
handle(app);

export default app;
