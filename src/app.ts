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
import DatabaseConnection from '@config/pricing-db';

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

// Validate requests against defined OpenApi spec
app.use(
  middleware({
    apiSpec: config.DIR_SWAGGER || '',
    validateResponses: false,
    validateRequests: true,
    validateSecurity: true,
  })
);
// Serve Swagger UI when not in production
if (config.NODE_ENV !== 'production') {
  const swaggerDocument = YAML.load(config.DIR_SWAGGER || '');
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
}

DatabaseConnection.getInstance();

// API routes prefix
app.use('/api/v1', router);

app.use(
  errorLogger({
    winstonInstance: logging,
  })
);

// Use error handlers
handle(app);

export default app;
