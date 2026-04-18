import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ScoreBadge from '../components/common/ScoreBadge.jsx';
import QuestionCard from '../components/quiz/QuestionCard.jsx';
import Button from '../components/common/Button.jsx';
import { buildResultRowsFromQuizDetail } from '../utils/helpers.js';
import { getErrorMessage, getQuizById } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';

const PastQuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [quizDetail, setQuizDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const payload = await getQuizById(quizId);
        if (isMounted) {
          setQuizDetail(payload);
        }
      } catch (error) {
        pushToast({ type: 'error', message: getErrorMessage(error, 'Unable to load quiz summary.') });
        navigate('/history');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [quizId, navigate, pushToast]);

  const resultRows = useMemo(() => buildResultRowsFromQuizDetail(quizDetail), [quizDetail]);
  const resultMap = useMemo(
    () => new Map(resultRows.map((row) => [row.questionId, row])),
    [resultRows]
  );

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading quiz summary..." />
      </PageContainer>
    );
  }

  if (!quizDetail?.result) {
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
        <h1 className="page-title">{quizDetail.jobTitle}</h1>
        <div className="score-row">
          <span>Score</span>
          <ScoreBadge score={quizDetail.result.score} />
        </div>
      </Card>

      <section className="section-stack">
        {quizDetail.questions.map((question) => (
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
        <p className="body-copy">{quizDetail.learningSummary}</p>
      </Card>
    </PageContainer>
  );
};

export default PastQuizPage;