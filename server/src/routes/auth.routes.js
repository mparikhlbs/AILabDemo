import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  loginController,
  meController,
  resetQuestionController,
  resetVerifyController,
  signupController,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

router.post('/signup', signupController);
router.post('/login', loginLimiter, loginController);
router.get('/me', authMiddleware, meController);
router.post('/reset-password/question', resetQuestionController);
router.post('/reset-password/verify', resetVerifyController);

export default router;