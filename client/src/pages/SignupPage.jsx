import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import useAuth from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { getErrorMessage } from '../services/api.js';

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;

const SignupPage = () => {
  const { isAuthenticated, signup } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!USERNAME_PATTERN.test(form.username.trim())) {
      nextErrors.username = 'Use 3-30 characters with letters, numbers, or underscores.';
    }

    if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!form.securityQuestion.trim()) {
      nextErrors.securityQuestion = 'Security question is required.';
    }

    if (!form.securityAnswer.trim()) {
      nextErrors.securityAnswer = 'Security answer is required.';
    }

    return nextErrors;
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(form);
      pushToast({ type: 'success', message: 'Account created.' });
      navigate('/dashboard');
    } catch (error) {
      pushToast({ type: 'error', message: getErrorMessage(error, 'Unable to create account.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <h1 className="page-title">Create Account</h1>
        <form className="form-stack" onSubmit={onSubmit}>
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={onChange}
            autoComplete="username"
            error={errors.username}
            required
          />
          <Input
            label="Password"
            name="password"
            value={form.password}
            onChange={onChange}
            type="password"
            autoComplete="new-password"
            error={errors.password}
            required
          />
          <Input
            label="Security Question"
            name="securityQuestion"
            value={form.securityQuestion}
            onChange={onChange}
            error={errors.securityQuestion}
            placeholder="Example: What was your first pet's name?"
            required
          />
          <Input
            label="Security Answer"
            name="securityAnswer"
            value={form.securityAnswer}
            onChange={onChange}
            error={errors.securityAnswer}
            required
          />
          <Button type="submit" loading={isSubmitting}>
            Create account
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
};

export default SignupPage;