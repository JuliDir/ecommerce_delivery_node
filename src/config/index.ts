import dotenv from 'dotenv';

const envFound = dotenv.config();
if (envFound.error) {
  throw new Error("Couldn't find .env file");
}

export default {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 8080),
  DOMAIN: process.env.DOMAIN,
  DIR_SWAGGER: 'src/config/docs/swagger.yml',
  DIR_ERRORS: 'src/config/errors/error.yml',
  SECRET_KEY: process.env.SECRET_KEY || 'secret',
  API_KEY: process.env.API_KEY,
  MONGO_URL: process.env.MONGO_URL,
  SECURITY_URL: process.env.SECURITY_URL || '',
  CURRENT_USER: process.env.CURRENT_USER || '',
  RABBIT_URL: process.env.RABBIT_URL || '',
  QUEUE_STATS: process.env.QUEUE_STATS || '',
};
