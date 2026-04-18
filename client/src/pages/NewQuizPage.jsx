import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import TextArea from '../components/common/TextArea.jsx';
import Button from '../components/common/Button.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { createQuiz, getErrorMessage } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';

const MAX_JOB_DESCRIPTION_LENGTH = 15000;

const NewQuizPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    const trimmed = jobDescription.trim();

    if (!trimmed) {
      setError('Please paste a job description before submitting.');
      return;
    }

    if (trimmed.length < 50) {
      setError('Job description must be at least 50 characters.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const quiz = await createQuiz({ jobDescription: trimmed });
      pushToast({ type: 'success', message: 'Quiz generated successfully.' });
      navigate(`/quiz/${quiz.quizId}`, { state: { quiz } });
    } catch (requestError) {
      pushToast({
        type: 'error',
        message: getErrorMessage(requestError, 'Something went wrong generating your quiz. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <PageContainer>
        <LoadingSpinner label="Generating your quiz..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <h1 className="page-title">Generate a Quiz</h1>
        <p className="body-copy">Paste a job description and get five focused multiple-choice questions.</p>

        <form className="form-stack" onSubmit={onSubmit}>
          <TextArea
            label="Job Description"
            name="jobDescription"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the full job description here..."
            rows={16}
            maxLength={MAX_JOB_DESCRIPTION_LENGTH}
            error={error}
          />
          <Button type="submit" disabled={jobDescription.trim().length < 50}>
            Generate Quiz
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
};

export default NewQuizPage;