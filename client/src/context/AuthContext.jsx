import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getMe, loginUser, signupUser } from '../services/api.js';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'jd_quiz_token';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      clearSession();
    };

    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!token) {
        if (isMounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const currentUser = await getMe();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [token, clearSession]);

  const persistSession = useCallback((authPayload) => {
    localStorage.setItem(TOKEN_KEY, authPayload.token);
    setToken(authPayload.token);
    setUser({ userId: authPayload.userId, username: authPayload.username });
  }, []);

  const signup = useCallback(
    async (payload) => {
      const authPayload = await signupUser(payload);
      persistSession(authPayload);
      return authPayload;
    },
    [persistSession]
  );

  const login = useCallback(
    async (payload) => {
      const authPayload = await loginUser(payload);
      persistSession(authPayload);
      return authPayload;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      signup,
      login,
      logout,
    }),
    [token, user, isBootstrapping, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};