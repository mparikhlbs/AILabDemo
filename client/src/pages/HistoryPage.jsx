import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ScoreBadge from '../components/common/ScoreBadge.jsx';
import { formatDate } from '../utils/helpers.js';
import { getErrorMessage, getQuizzes } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        const payload = await getQuizzes();
        if (isMounted) {
          setQuizzes(payload.quizzes || []);
        }
      } catch (error) {
        pushToast({ type: 'error', message: getErrorMessage(error, 'Unable to load history.') });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [pushToast]);

  return (
    <PageContainer>
      <Card>
        <h1 className="page-title">Quiz History</h1>
        <p className="body-copy">Review all past quizzes and scores.</p>
      </Card>

      {isLoading ? (
        <div className="skeleton-stack">
          {[1, 2, 3].map((index) => (
            <div key={index} className="skeleton-card" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          message="You haven't taken any quizzes yet. Paste a job description to get started."
          ctaText="Create a quiz"
          onCtaClick={() => navigate('/quiz/new')}
        />
      ) : (
        <div className="list-stack">
          {quizzes.map((quiz) => (
            <Link key={quiz.quizId} className="list-card" to={`/history/${quiz.quizId}`}>
              <div>
                <h3>{quiz.jobTitle}</h3>
                <p>{formatDate(quiz.createdAt)}</p>
              </div>
              <ScoreBadge score={quiz.score} />
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default HistoryPage;