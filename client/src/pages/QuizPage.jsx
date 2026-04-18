import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import QuestionCard from '../components/quiz/QuestionCard.jsx';
import { getErrorMessage, getQuizById, submitQuiz } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';

const QuizPage = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(!location.state?.quiz);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quiz) {
      return undefined;
    }

    let isMounted = true;

    const loadQuiz = async () => {
      try {
        const payload = await getQuizById(quizId);

        if (payload.result) {
          navigate(`/quiz/${quizId}/results`, { replace: true });
          return;
        }

        if (isMounted) {
          setQuiz(payload);
        }
      } catch (error) {
        pushToast({ type: 'error', message: getErrorMessage(error, 'Unable to load quiz.') });
        navigate('/dashboard');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadQuiz();

    return () => {
      isMounted = false;
    };
  }, [quiz, quizId, navigate, pushToast]);

  const questions = useMemo(() => quiz?.questions || [], [quiz]);
  const allAnswered = questions.length === 5 && questions.every((question) => Boolean(answers[question.questionId]));

  const handleSelect = (questionId, selectedLabel) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: selectedLabel,
    }));
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        answers: questions.map((question) => ({
          questionId: question.questionId,
          selectedAnswer: answers[question.questionId],
        })),
      };

      const response = await submitQuiz(quizId, payload);

      navigate(`/quiz/${quizId}/results`, {
        state: {
          submission: response,
          quizQuestions: questions,
          jobTitle: quiz?.jobTitle,
        },
      });
    } catch (error) {
      pushToast({ type: 'error', message: getErrorMessage(error, 'Unable to submit quiz. Please try again.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading quiz..." />
      </PageContainer>
    );
  }

  if (!quiz) {
    return (
      <PageContainer>
        <Card>
          <p>Quiz not found.</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <h1 className="page-title">{quiz.jobTitle || 'Job Quiz'}</h1>
        <p className="body-copy">Answer all 5 questions before submitting.</p>
      </Card>

      <section className="section-stack">
        {questions.map((question) => (
          <QuestionCard
            key={question.questionId}
            question={question}
            selectedAnswer={answers[question.questionId]}
            onSelect={(label) => handleSelect(question.questionId, label)}
            disabled={isSubmitting}
          />
        ))}
      </section>

      <Button className="submit-button" onClick={handleSubmit} disabled={!allAnswered} loading={isSubmitting}>
        Submit Quiz
      </Button>
    </PageContainer>
  );
};

export default QuizPage;