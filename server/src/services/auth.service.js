import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  createUserDocument,
  findUserById,
  findUserByUsername,
  updateUserPassword,
} from '../models/user.model.js';
import {
  normalizeUsername,
  sanitizeString,
  validatePassword,
  validateRequiredText,
  validateUsername,
} from '../utils/validators.js';
import { AppError } from '../utils/errors.js';

const BCRYPT_ROUNDS = 10;
const TOKEN_EXPIRY = '24h';

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required.');
  }
  return process.env.JWT_SECRET;
};

const signToken = (payload) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: TOKEN_EXPIRY,
  });

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());

export const signup = async ({ username, password, securityQuestion, securityAnswer }) => {
  const normalizedUsername = validateUsername(username);
  const validatedPassword = validatePassword(password);
  const validatedQuestion = validateRequiredText(securityQuestion, 'Security question', 300);
  const validatedAnswer = validateRequiredText(securityAnswer, 'Security answer', 200);

  const existingUser = await findUserByUsername(normalizedUsername);
  if (existingUser) {
    throw new AppError(409, 'Username already exists.');
  }

  const [passwordHash, securityAnswerHash] = await Promise.all([
    bcrypt.hash(validatedPassword, BCRYPT_ROUNDS),
    bcrypt.hash(validatedAnswer.toLowerCase(), BCRYPT_ROUNDS),
  ]);

  const now = new Date().toISOString();

  let createdUser;
  try {
    createdUser = await createUserDocument({
      username: normalizedUsername,
      passwordHash,
      securityQuestion: validatedQuestion,
      securityAnswerHash,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    if (error?.errorType === 'uniqueViolated') {
      throw new AppError(409, 'Username already exists.');
    }
    throw error;
  }

  const token = signToken({ userId: createdUser._id, username: createdUser.username });

  return {
    userId: createdUser._id,
    username: createdUser.username,
    token,
  };
};

export const login = async ({ username, password }) => {
  const normalizedUsername = normalizeUsername(username);
  const validatedPassword = sanitizeString(password, 128);

  if (!normalizedUsername || !validatedPassword) {
    throw new AppError(401, 'Incorrect username or password.');
  }

  const user = await findUserByUsername(normalizedUsername);
  if (!user) {
    throw new AppError(401, 'Incorrect username or password.');
  }

  const isMatch = await bcrypt.compare(validatedPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError(401, 'Incorrect username or password.');
  }

  const token = signToken({ userId: user._id, username: user.username });

  return {
    userId: user._id,
    username: user.username,
    token,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(401, 'Invalid or expired token.');
  }

  return {
    userId: user._id,
    username: user.username,
  };
};

export const getSecurityQuestionForReset = async ({ username }) => {
  const normalizedUsername = validateUsername(username);
  const user = await findUserByUsername(normalizedUsername);

  if (!user) {
    throw new AppError(404, 'Username not found.');
  }

  return {
    securityQuestion: user.securityQuestion,
  };
};

export const verifySecurityAnswerAndReset = async ({ username, securityAnswer, newPassword }) => {
  const normalizedUsername = validateUsername(username);
  const validatedAnswer = validateRequiredText(securityAnswer, 'Security answer', 200);
  const validatedNewPassword = validatePassword(newPassword, 'New password');

  const user = await findUserByUsername(normalizedUsername);
  if (!user) {
    throw new AppError(404, 'Username not found.');
  }

  const answerMatches = await bcrypt.compare(validatedAnswer.toLowerCase(), user.securityAnswerHash);
  if (!answerMatches) {
    throw new AppError(401, 'Incorrect answer.');
  }

  const passwordHash = await bcrypt.hash(validatedNewPassword, BCRYPT_ROUNDS);
  await updateUserPassword(user._id, passwordHash);

  return {
    message: 'Password updated successfully.',
  };
};
