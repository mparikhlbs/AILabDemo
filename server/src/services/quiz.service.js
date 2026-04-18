import { generateQuizWithRetry } from './claude.service.js';
import {
  createQuizDocument,
  findQuizById,
  findQuizzesByUserId,
} from '../models/quiz.model.js';
import {
  createResultDocument,
  findResultByQuizId,
  findResultsByUserId,
} from '../models/result.model.js';
import { AppError } from '../utils/errors.js';
import { sanitizeJobDescription, sanitizeString, validateAnswerPayload } from '../utils/validators.js';

const extractJobTitleFallback = (jobDescription) => {
  const firstLine = sanitizeString(jobDescription.split('\n').find((line) => line.trim()), 160);
  return firstLine || 'Untitled Role';
};

const mapQuizForCreationResponse = (quizDoc) => ({
  quizId: quizDoc._id,
  jobTitle: quizDoc.jobTitle,
  questions: quizDoc.questions.map((question) => ({
    questionId: question.questionId,
    questionText: question.questionText,
    options: question.options,
  })),
});

const mapResultRows = (quiz, answersByQuestion) => {
  return quiz.questions.map((question) => {
    const selectedAnswer = answersByQuestion.get(question.questionId);

    if (!selectedAnswer) {
      throw new AppError(400, `Missing answer for ${question.questionId}.`);
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    return {
      questionId: question.questionId,
      questionText: question.questionText,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      wrongExplanation: isCorrect ? null : question.wrongExplanations[selectedAnswer] || null,
    };
  });
};

export const createQuiz = async ({ userId, jobDescription }) => {
  const cleanedDescription = sanitizeJobDescription(jobDescription);
  const generated = await generateQuizWithRetry(cleanedDescription);

  const now = new Date().toISOString();
  const quizDoc = {
    userId,
    jobDescription: cleanedDescription,
    jobTitle: generated.jobTitle || extractJobTitleFallback(cleanedDescription),
    questions: generated.questions,
    learningSummary: generated.learningSummary,
    createdAt: now,
  };

  const createdQuiz = await createQuizDocument(quizDoc);
  return mapQuizForCreationResponse(createdQuiz);
};

export const listQuizzes = async ({ userId }) => {
  const [quizzes, results] = await Promise.all([
    findQuizzesByUserId(userId),
    findResultsByUserId(userId),
  ]);

  const scoreByQuizId = new Map(results.map((result) => [result.quizId, result.score]));

  return {
    quizzes: quizzes.map((quiz) => ({
      quizId: quiz._id,
      jobTitle: quiz.jobTitle,
      score: scoreByQuizId.has(quiz._id) ? scoreByQuizId.get(quiz._id) : null,
      createdAt: quiz.createdAt,
    })),
  };
};

export const getQuizDetails = async ({ userId, quizId }) => {
  const quiz = await findQuizById(quizId);

  if (!quiz) {
    throw new AppError(404, 'Quiz not found.');
  }

  if (quiz.userId !== userId) {
    throw new AppError(403, 'You do not have permission to access this quiz.');
  }

  const result = await findResultByQuizId(quizId);

  const base = {
    quizId: quiz._id,
    jobTitle: quiz.jobTitle,
    jobDescription: quiz.jobDescription,
    createdAt: quiz.createdAt,
  };

  if (!result) {
    return {
      ...base,
      questions: quiz.questions.map((question) => ({
        questionId: question.questionId,
        questionText: question.questionText,
        options: question.options,
      })),
    };
  }

  return {
    ...base,
    questions: quiz.questions,
    learningSummary: quiz.learningSummary,
    result: {
      answers: result.answers,
      score: result.score,
      completedAt: result.completedAt,
    },
  };
};

export const submitQuiz = async ({ userId, quizId, answers }) => {
  const validatedAnswers = validateAnswerPayload(answers);

  const quiz = await findQuizById(quizId);
  if (!quiz) {
    throw new AppError(404, 'Quiz not found.');
  }

  if (quiz.userId !== userId) {
    throw new AppError(403, 'You do not have permission to submit this quiz.');
  }

  const existingResult = await findResultByQuizId(quizId);
  if (existingResult) {
    throw new AppError(409, 'Quiz already submitted.');
  }

  const answerMap = new Map(validatedAnswers.map((answer) => [answer.questionId, answer.selectedAnswer]));
  const resultRows = mapResultRows(quiz, answerMap);
  const score = resultRows.reduce((total, row) => total + (row.isCorrect ? 1 : 0), 0);

  const completedAt = new Date().toISOString();

  await createResultDocument({
    quizId: quiz._id,
    userId,
    answers: resultRows.map((row) => ({
      questionId: row.questionId,
      selectedAnswer: row.selectedAnswer,
      isCorrect: row.isCorrect,
    })),
    score,
    completedAt,
  });

  return {
    score,
    results: resultRows,
    learningSummary: quiz.learningSummary,
  };
};