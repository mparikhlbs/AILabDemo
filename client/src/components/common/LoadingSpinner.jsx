const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="loading-wrap" role="status" aria-live="polite">
    <span className="loading-spinner" aria-hidden="true" />
    <p>{label}</p>
  </div>
);

export default LoadingSpinner;