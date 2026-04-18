import Button from './Button.jsx';

const EmptyState = ({ message, ctaText, onCtaClick }) => (
  <div className="empty-state">
    <p>{message}</p>
    {ctaText ? (
      <Button variant="secondary" onClick={onCtaClick}>
        {ctaText}
      </Button>
    ) : null}
  </div>
);

export default EmptyState;