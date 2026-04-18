import { AppError } from './errors.js';

const TAG_REGEX = /<[^>]*>/g;
const WHITESPACE_REGEX = /\s+/g;

export const stripHtmlTags = (value = '') => String(value).replace(TAG_REGEX, '');

export const sanitizeString = (value, maxLength = 5000) => {
  if (value === undefined || value === null) {
    return '';
  }

  const withoutTags = stripHtmlTags(String(value));
  const compact = withoutTags.replace(/\u0000/g, '').trim();
  return compact.slice(0, maxLength);
};

export const normalizeUsername = (username) =>
  sanitizeString(username, 30).replace(WHITESPACE_REGEX, '').toLowerCase();

export const validateUsername = (username) => {
  const normalized = normalizeUsername(username);

  if (!/^[a-z0-9_]{3,30}$/.test(normalized)) {
    throw new AppError(
      400,
      'Username must be 3-30 characters and contain only letters, numbers, and underscores.'
    );
  }

  return normalized;
};

export const validatePassword = (password, label = 'Password') => {
  const cleaned = sanitizeString(password, 128);
  if (cleaned.length < 8) {
    throw new AppError(400, `${label} must be at least 8 characters.`);
  }
  return cleaned;
};

export const validateRequiredText = (value, fieldLabel, maxLength = 255) => {
  const cleaned = sanitizeString(value, maxLength);
  if (!cleaned) {
    throw new AppError(400, `${fieldLabel} is required.`);
  }
  return cleaned;
};

export const sanitizeJobDescription = (jobDescription) => {
  const cleaned = sanitizeString(jobDescription, 20000);
  if (!cleaned || !cleaned.trim()) {
    throw new AppError(400, 'Please paste a job description before submitting.');
  }
  if (cleaned.length < 50) {
    throw new AppError(400, 'Job description must be at least 50 characters.');
  }

  return cleaned.slice(0, 15000);
};

export const validateAnswerPayload = (answers) => {
  if (!Array.isArray(answers) || answers.length !== 5) {
    throw new AppError(400, 'Exactly 5 answers are required.');
  }

  const seen = new Set();

  answers.forEach((answer) => {
    const questionId = sanitizeString(answer?.questionId, 10);
    const selectedAnswer = sanitizeString(answer?.selectedAnswer, 1).toUpperCase();

    if (!/^q[1-5]$/.test(questionId)) {
      throw new AppError(400, 'Invalid questionId in answers payload.');
    }

    if (!['A', 'B', 'C', 'D'].includes(selectedAnswer)) {
      throw new AppError(400, 'selectedAnswer must be one of A, B, C, or D.');
    }

    if (seen.has(questionId)) {
      throw new AppError(400, 'Duplicate questionId found in answers payload.');
    }

    seen.add(questionId);
  });

  if (seen.size !== 5) {
    throw new AppError(400, 'Answers must include q1 through q5 exactly once.');
  }

  return answers.map((answer) => ({
    questionId: sanitizeString(answer.questionId, 10),
    selectedAnswer: sanitizeString(answer.selectedAnswer, 1).toUpperCase(),
  }));
};

export const validateQuizSchema = (quizPayload) => {
  if (!quizPayload || typeof quizPayload !== 'object') {
    throw new AppError(500, 'Quiz payload is not an object.');
  }

  const jobTitle = sanitizeString(quizPayload.jobTitle, 160);
  const learningSummary = sanitizeString(quizPayload.learningSummary, 2000);

  if (!jobTitle) {
    throw new AppError(500, 'Quiz payload is missing jobTitle.');
  }

  if (!learningSummary) {
    throw new AppError(500, 'Quiz payload is missing learningSummary.');
  }

  if (!Array.isArray(quizPayload.questions) || quizPayload.questions.length !== 5) {
    throw new AppError(500, 'Quiz payload must contain exactly 5 questions.');
  }

  const expectedIds = ['q1', 'q2', 'q3', 'q4', 'q5'];

  const questions = quizPayload.questions.map((question, index) => {
    const questionId = sanitizeString(question?.questionId, 10) || expectedIds[index];
    const questionText = sanitizeString(question?.questionText, 500);
    const explanation = sanitizeString(question?.explanation, 1000);
    const correctAnswer = sanitizeString(question?.correctAnswer, 1).toUpperCase();

    if (!questionText) {
      throw new AppError(500, `Question ${index + 1} is missing questionText.`);
    }

    if (!explanation) {
      throw new AppError(500, `Question ${index + 1} is missing explanation.`);
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      throw new AppError(500, `Question ${index + 1} has an invalid correctAnswer.`);
    }

    if (!Array.isArray(question?.options) || question.options.length !== 4) {
      throw new AppError(500, `Question ${index + 1} must have exactly 4 options.`);
    }

    const options = question.options.map((option, optionIndex) => {
      const expectedLabel = ['A', 'B', 'C', 'D'][optionIndex];
      const label = sanitizeString(option?.label, 1).toUpperCase() || expectedLabel;
      const text = sanitizeString(option?.text, 300);

      if (label !== expectedLabel) {
        throw new AppError(500, `Question ${index + 1} options must be labelled A-D in order.`);
      }

      if (!text) {
        throw new AppError(500, `Question ${index + 1} option ${expectedLabel} is empty.`);
      }

      return {
        label,
        text,
      };
    });

    const labels = options.map((option) => option.label);

    if (!labels.includes(correctAnswer)) {
      throw new AppError(500, `Question ${index + 1} correctAnswer does not match options.`);
    }

    const rawWrongExplanations = question?.wrongExplanations || {};
    const wrongExplanations = {};

    labels
      .filter((label) => label !== correctAnswer)
      .forEach((label) => {
        const wrongText = sanitizeString(rawWrongExplanations[label], 800);
        if (!wrongText) {
          throw new AppError(500, `Question ${index + 1} missing wrong explanation for ${label}.`);
        }
        wrongExplanations[label] = wrongText;
      });

    return {
      questionId,
      questionText,
      options,
      correctAnswer,
      explanation,
      wrongExplanations,
    };
  });

  return {
    jobTitle,
    questions,
    learningSummary,
  };
};