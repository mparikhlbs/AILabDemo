import { createQuiz, getQuizDetails, listQuizzes, submitQuiz } from '../services/quiz.service.js';

export const createQuizController = async (req, res, next) => {
  try {
    const quiz = await createQuiz({
      userId: req.user.userId,
      jobDescription: req.body?.jobDescription,
    });

    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};

export const listQuizzesController = async (req, res, next) => {
  try {
    const payload = await listQuizzes({ userId: req.user.userId });
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

export const getQuizController = async (req, res, next) => {
  try {
    const payload = await getQuizDetails({
      userId: req.user.userId,
      quizId: req.params.quizId,
    });
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

export const submitQuizController = async (req, res, next) => {
  try {
    const payload = await submitQuiz({
      userId: req.user.userId,
      quizId: req.params.quizId,
      answers: req.body?.answers,
    });

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};