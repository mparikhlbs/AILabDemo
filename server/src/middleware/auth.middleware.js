import { verifyToken } from '../services/auth.service.js';
import { AppError } from '../utils/errors.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Invalid or expired token.'));
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };
    return next();
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired token.'));
  }
};