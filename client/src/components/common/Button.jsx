const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : children}
    </button>
  );
};

export default Button;