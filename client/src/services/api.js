import axios from 'axios';

const TOKEN_KEY = 'jd_quiz_token';
const AUTH_EXEMPT_PATHS = ['/auth/login', '/auth/signup', '/auth/reset-password/question', '/auth/reset-password/verify'];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasToken = Boolean(localStorage.getItem(TOKEN_KEY));
    const requestUrl = error.config?.url || '';
    const isAuthExempt = AUTH_EXEMPT_PATHS.some((path) => requestUrl.includes(path));

    if (error.response?.status === 401 && hasToken && !isAuthExempt) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

const unwrap = (response) => response.data;

export const getErrorMessage = (error, fallback = 'Something went wrong.') => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message === 'Network Error') {
    return 'Unable to connect. Please check your connection and try again.';
  }
  return fallback;
};

export const signupUser = (payload) => api.post('/auth/signup', payload).then(unwrap);
export const loginUser = (payload) => api.post('/auth/login', payload).then(unwrap);
export const getMe = () => api.get('/auth/me').then(unwrap);
export const getResetQuestion = (payload) => api.post('/auth/reset-password/question', payload).then(unwrap);
export const verifyResetPassword = (payload) => api.post('/auth/reset-password/verify', payload).then(unwrap);

export const createQuiz = (payload) => api.post('/quizzes', payload).then(unwrap);
export const getQuizzes = () => api.get('/quizzes').then(unwrap);
export const getQuizById = (quizId) => api.get(`/quizzes/${quizId}`).then(unwrap);
export const submitQuiz = (quizId, payload) => api.post(`/quizzes/${quizId}/submit`, payload).then(unwrap);

export default api;