import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ScoreBadge from '../components/common/ScoreBadge.jsx';
import { formatDate } from '../utils/helpers.js';
import { getErrorMessage, getQuizzes } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';

const DashboardPage = () => {
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await getQuizzes();
        if (isMounted) {
          setQuizzes(response.quizzes || []);
        }
      } catch (error) {
        pushToast({ type: 'error', message: getErrorMessage(error, 'Unable to load dashboard.') });
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
  }, [pushToast]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading dashboard..." />
      </PageContainer>
    );
  }

  const recent = quizzes.slice(0, 3);

  return (
    <PageContainer>
      <Card>
        <h1 className="page-title">Dashboard</h1>
        <p className="body-copy">Create a new quiz or review your recent progress.</p>
        <Button onClick={() => navigate('/quiz/new')}>Paste a new job description</Button>
      </Card>

      <section className="section-stack">
        <h2 className="section-title">Recent Quizzes</h2>

        {recent.length === 0 ? (
          <EmptyState
            message="You haven't taken any quizzes yet. Paste a job description to get started."
            ctaText="Create first quiz"
            onCtaClick={() => navigate('/quiz/new')}
          />
        ) : (
          <div className="list-stack">
            {recent.map((quiz) => (
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
      </section>
    </PageContainer>
  );
};

export default DashboardPage;