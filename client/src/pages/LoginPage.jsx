import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import useAuth from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { getErrorMessage } from '../services/api.js';

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
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

    if (!form.username.trim()) {
      nextErrors.username = 'Username is required.';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Password is required.';
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
      await login({ username: form.username, password: form.password });
      pushToast({ type: 'success', message: 'Welcome back.' });
      navigate('/dashboard');
    } catch (error) {
      pushToast({ type: 'error', message: getErrorMessage(error, 'Incorrect username or password.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <h1 className="page-title">Login</h1>
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
            autoComplete="current-password"
            error={errors.password}
            required
          />
          <Button type="submit" loading={isSubmitting}>
            Login
          </Button>
        </form>

        <p className="helper-link-row">
          Forgot your password? <Link to="/reset-password">Reset it here</Link>.
        </p>
      </Card>
    </PageContainer>
  );
};

export default LoginPage;