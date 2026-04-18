export const formatDate = (isoString) => {
  if (!isoString) {
    return '';
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getScoreTone = (score) => {
  if (score === null || score === undefined) {
    return 'neutral';
  }
  if (score >= 4) {
    return 'good';
  }
  if (score >= 2) {
    return 'mid';
  }
  return 'bad';
};

export const buildResultRowsFromQuizDetail = (quizDetail) => {
  if (!quizDetail?.result || !Array.isArray(quizDetail.questions)) {
    return [];
  }

  const answerMap = new Map(
    (quizDetail.result.answers || []).map((answer) => [answer.questionId, answer])
  );

  return quizDetail.questions.map((question) => {
    const answer = answerMap.get(question.questionId);
    const selectedAnswer = answer?.selectedAnswer || null;
    const isCorrect = Boolean(answer?.isCorrect);

    return {
      questionId: question.questionId,
      questionText: question.questionText,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      wrongExplanation:
        !isCorrect && selectedAnswer && question.wrongExplanations
          ? question.wrongExplanations[selectedAnswer] || null
          : null,
    };
  });
};