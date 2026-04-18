const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 10,
  error,
  maxLength,
  helperText,
}) => (
  <div className="field-group">
    <label className="field-label" htmlFor={name}>
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`field-textarea ${error ? 'field-input-error' : ''}`}
      maxLength={maxLength}
    />
    <div className="field-meta-row">
      <p className={`field-error-inline ${error ? 'visible' : ''}`}>{error || ''}</p>
      {typeof maxLength === 'number' ? (
        <p className="field-helper-text">
          {value.length}/{maxLength}
        </p>
      ) : helperText ? (
        <p className="field-helper-text">{helperText}</p>
      ) : null}
    </div>
  </div>
);

export default TextArea;