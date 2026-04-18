import { AppError } from '../utils/errors.js';

export const requireJsonBody = (req, _res, next) => {
  if (!req.is('application/json')) {
    return next(new AppError(400, 'Request body must be JSON.'));
  }
  return next();
};