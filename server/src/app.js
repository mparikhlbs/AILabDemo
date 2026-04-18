import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import { AppError, isAppError } from './utils/errors.js';

const app = express();

const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: '300kb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

app.use(globalLimiter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

app.use((_req, _res, next) => {
  next(new AppError(404, 'Route not found.'));
});

app.use((error, _req, res, _next) => {
  if (isAppError(error)) {
    const payload = { error: error.message };
    if (error.details) {
      payload.details = error.details;
    }
    return res.status(error.statusCode).json(payload);
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error.' });
});

export default app;