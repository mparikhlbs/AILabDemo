import { resultsDb } from '../config/db.js';

export const createResultDocument = async (result) => resultsDb.insert(result);

export const findResultByQuizId = async (quizId) => resultsDb.findOne({ quizId });

export const findResultsByUserId = async (userId) => resultsDb.find({ userId });