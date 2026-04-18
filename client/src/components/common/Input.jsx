const Input = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  autoComplete,
  required = false,
}) => (
  <div className="field-group">
    <label className="field-label" htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`field-input ${error ? 'field-input-error' : ''}`}
      autoComplete={autoComplete}
      required={required}
    />
    {error ? <p className="field-error">{error}</p> : null}
  </div>
);

export default Input;