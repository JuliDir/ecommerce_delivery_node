import { NextFunction, Request, Response } from 'express';
import { CustomError } from './error.model';
import { GeneralError } from './general-error.model';

const createUnhandledError = (message: string): CustomError => {
  return new CustomError(message);
};

const handleNotFound = (req: Request, res: Response) => {
  const general: GeneralError = {
    errors: [createUnhandledError('Not found')],
    status: 404,
    message: `${req.path} not found`,
  };
  res.status(404).json(general);
};


const handleUnhandledError = (err: any, res: Response) => {
  if (err.errors && err.status) {
    return res.status(err.status).json(err);
  }

  const sequelizeError = handleSequelizeError(err);
  if (sequelizeError) {
    return res.status(sequelizeError.status).json(sequelizeError);
  }

  const generalError = createGeneralError(err);
  return res.status(generalError.status).json(generalError);
};

const handleErrors = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  handleUnhandledError(err, res);
};

const handle = (app: any) => {
  app.use(handleNotFound);
  app.use(handleErrors);
};

const createGeneralError = (err: any): GeneralError => {
  if (err.status) {
    return {
      status: err.status,
      errors: [new CustomError(err.message, err.status)],
      message: err.message,
    };
  }
  return {
    status: 500,
    errors: [new CustomError(err.message || 'Internal Server Error')],
    message: err.message || 'Internal Server Error',
  };
};

const handleSequelizeError = (err: any): GeneralError | undefined => {
  if (err.name && err.name.includes('Sequelize')) {
    return {
      message: err.message,
      status: 400,
      errors: [new CustomError(err.message, 400)],
    };
  }
  return undefined;
};


export default handle;
