const Card = ({ children, clickable = false, className = '' }) => {
  return <section className={`card ${clickable ? 'card-clickable' : ''} ${className}`.trim()}>{children}</section>;
};

export default Card;