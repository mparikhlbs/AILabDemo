import { Link, Navigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import useAuth from '../hooks/useAuth.js';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageContainer>
      <Card>
        <h1 className="page-title">Master Any Job Description Before the Interview</h1>
        <p className="body-copy">
          Paste a job description and get a targeted 5-question quiz that checks how well you understand the company,
          role, responsibilities, skills, and context.
        </p>
        <div className="button-row">
          <Link className="btn btn-primary" to="/signup">
            Create account
          </Link>
          <Link className="btn btn-secondary" to="/login">
            Login
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
};

export default HomePage;