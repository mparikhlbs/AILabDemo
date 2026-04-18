const Toast = ({ type = 'info', message, onClose }) => {
  return (
    <div className={`toast toast-${type}`} role="status">
      <p>{message}</p>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Close notification">
        x
      </button>
    </div>
  );
};

export default Toast;