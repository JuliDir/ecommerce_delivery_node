import {CustomError} from './error.model';

export interface GeneralError {
  errors: CustomError[];
  status: number;
  message: string;
}
