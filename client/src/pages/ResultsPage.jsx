import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ScoreBadge from '../components/common/ScoreBadge.jsx';
import QuestionCard from '../components/quiz/QuestionCard.jsx';
import Button from '../components/common/Button.jsx';
import { buildResultRowsFromQuizDetail } from '../utils/helpers.js';
import { getErrorMessage, getQuizById } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';

const ResultsPage = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [quizDetail, setQuizDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(!location.state?.submission);

  const submission = location.state?.submission || null;
  const routedQuestions = location.state?.quizQuestions || [];
  const routedTitle = location.state?.jobTitle || '';

  useEffect(() => {
    if (submission) {
      return undefined;
    }

    let isMounted = true;

    const loadDetails = async () => {
      try {
        const payload = await getQuizById(quizId);
        if (isMounted) {
          setQuizDetail(payload);
        }
      } catch (error) {
        pushToast({ type: 'error', message: getErrorMessage(error, 'Unable to load results.') });
        navigate('/history');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [submission, quizId, navigate, pushToast]);

  const score = submission?.score ?? quizDetail?.result?.score ?? null;
  const learningSummary = submission?.learningSummary ?? quizDetail?.learningSummary ?? '';

  const questions = useMemo(() => {
    if (routedQuestions.length > 0) {
      return routedQuestions;
    }
    return quizDetail?.questions || [];
  }, [quizDetail, routedQuestions]);

  const resultRows = useMemo(() => {
    if (submission?.results) {
      return submission.results;
    }
    return buildResultRowsFromQuizDetail(quizDetail);
  }, [submission, quizDetail]);

  const resultMap = useMemo(
    () => new Map(resultRows.map((row) => [row.questionId, row])),
    [resultRows]
  );

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading results..." />
      </PageContainer>
    );
  }

  if (!score && score !== 0) {
    return (
      <PageContainer>
        <Card>
          <h1 className="page-title">This quiz has not been submitted yet.</h1>
          <Button onClick={() => navigate(`/quiz/${quizId}`)}>Go to quiz</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <h1 className="page-title">Results: {routedTitle || quizDetail?.jobTitle || 'Job Quiz'}</h1>
        <div className="score-row">
          <span>Your score</span>
          <ScoreBadge score={score} />
        </div>
      </Card>

      <section className="section-stack">
        {questions.map((question) => (
          <QuestionCard
            key={question.questionId}
            question={question}
            showResult
            result={resultMap.get(question.questionId)}
            onSelect={() => {}}
          />
        ))}
      </section>

      <Card>
        <h2 className="section-title">Learning Summary</h2>
        <p className="body-copy">{learningSummary}</p>
        <p className="helper-link-row">
          View all past quizzes on the <Link to="/history">history page</Link>.
        </p>
      </Card>
    </PageContainer>
  );
};

export default ResultsPage;