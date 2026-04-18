const OptionButton = ({
  option,
  selected,
  disabled = false,
  onSelect,
  showResult = false,
  isCorrect = false,
  isSelectedWrong = false,
}) => {
  const classNames = ['option-button'];

  if (selected) {
    classNames.push('option-selected');
  }

  if (showResult && isCorrect) {
    classNames.push('option-correct');
  }

  if (showResult && isSelectedWrong) {
    classNames.push('option-incorrect');
  }

  return (
    <button
      type="button"
      className={classNames.join(' ')}
      onClick={() => onSelect(option.label)}
      disabled={disabled}
    >
      <span className="option-label">{option.label}</span>
      <span>{option.text}</span>
    </button>
  );
};

export default OptionButton;