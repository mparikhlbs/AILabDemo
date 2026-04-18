import { createContext, useCallback, useMemo, useState } from 'react';
import Toast from '../components/common/Toast.jsx';

export const ToastContext = createContext(null);

let toastCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ type = 'info', message }) => {
      const id = `toast-${Date.now()}-${toastCounter++}`;
      setToasts((current) => [...current, { id, type, message }]);
      window.setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({ pushToast, removeToast }),
    [pushToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};