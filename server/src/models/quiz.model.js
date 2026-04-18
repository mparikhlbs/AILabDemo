import { quizzesDb } from '../config/db.js';

export const createQuizDocument = async (quiz) => quizzesDb.insert(quiz);

export const findQuizById = async (quizId) => quizzesDb.findOne({ _id: quizId });

export const findQuizzesByUserId = async (userId) =>
  quizzesDb.find({ userId }).sort({ createdAt: -1 });