import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createQuizController,
  getQuizController,
  listQuizzesController,
  submitQuizController,
} from '../controllers/quiz.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

const createQuizLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip,
  message: { error: 'Quiz generation limit reached. Please try again later.' },
});

router.use(authMiddleware);
router.post('/', createQuizLimiter, createQuizController);
router.get('/', listQuizzesController);
router.get('/:quizId', getQuizController);
router.post('/:quizId/submit', submitQuizController);

export default router;