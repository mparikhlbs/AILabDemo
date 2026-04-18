import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { getResetQuestion, verifyResetPassword, getErrorMessage } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  const [errors, setErrors] = useState({});

  const handleQuestionLookup = async (event) => {
    event.preventDefault();
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setErrors({ username: 'Username is required.' });
      return;
    }

    setErrors({});
    setIsLoadingQuestion(true);

    try {
      const response = await getResetQuestion({ username: trimmedUsername });
      setSecurityQuestion(response.securityQuestion);
      setStep(2);
    } catch (error) {
      pushToast({ type: 'error', message: getErrorMessage(error, 'Unable to find that username.') });
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!securityAnswer.trim()) {
      nextErrors.securityAnswer = 'Security answer is required.';
    }

    if (newPassword.length < 8) {
      nextErrors.newPassword = 'New password must be at least 8 characters.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmittingReset(true);

    try {
      await verifyResetPassword({
        username: username.trim(),
        securityAnswer,
        newPassword,
      });
      pushToast({ type: 'success', message: 'Password updated successfully.' });
      navigate('/login');
    } catch (error) {
      pushToast({ type: 'error', message: getErrorMessage(error, 'Unable to reset password.') });
    } finally {
      setIsSubmittingReset(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <h1 className="page-title">Reset Password</h1>

        {step === 1 ? (
          <form className="form-stack" onSubmit={handleQuestionLookup}>
            <Input
              label="Username"
              name="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setErrors({});
              }}
              error={errors.username}
              required
            />
            <Button type="submit" loading={isLoadingQuestion}>
              Continue
            </Button>
          </form>
        ) : (
          <form className="form-stack" onSubmit={handleResetSubmit}>
            <div className="security-question-block">
              <p className="field-label">Security Question</p>
              <p>{securityQuestion}</p>
            </div>
            <Input
              label="Security Answer"
              name="securityAnswer"
              value={securityAnswer}
              onChange={(event) => {
                setSecurityAnswer(event.target.value);
                setErrors({});
              }}
              error={errors.securityAnswer}
              required
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setErrors({});
              }}
              error={errors.newPassword}
              required
            />
            <Button type="submit" loading={isSubmittingReset}>
              Update password
            </Button>
          </form>
        )}
      </Card>
    </PageContainer>
  );
};

export default ResetPasswordPage;