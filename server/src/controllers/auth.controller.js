import {
  getCurrentUser,
  getSecurityQuestionForReset,
  login,
  signup,
  verifySecurityAnswerAndReset,
} from '../services/auth.service.js';

export const signupController = async (req, res, next) => {
  try {
    const result = await signup(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const meController = async (req, res, next) => {
  try {
    const result = await getCurrentUser(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetQuestionController = async (req, res, next) => {
  try {
    const result = await getSecurityQuestionForReset(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetVerifyController = async (req, res, next) => {
  try {
    const result = await verifySecurityAnswerAndReset(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};