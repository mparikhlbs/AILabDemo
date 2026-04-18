import Card from '../common/Card.jsx';
import OptionButton from './OptionButton.jsx';

const QuestionCard = ({
  question,
  selectedAnswer,
  onSelect,
  disabled = false,
  showResult = false,
  result,
}) => {
  const answerForDisplay = showResult ? result?.selectedAnswer : selectedAnswer;

  return (
    <Card className="question-card">
      <h3 className="question-title">{question.questionText}</h3>
      <div className="options-stack">
        {question.options.map((option) => {
          const isCorrect = showResult && option.label === result?.correctAnswer;
          const isSelectedWrong = showResult && result?.selectedAnswer === option.label && !result?.isCorrect;

          return (
            <OptionButton
              key={`${question.questionId}-${option.label}`}
              option={option}
              selected={answerForDisplay === option.label}
              onSelect={onSelect}
              disabled={disabled || showResult}
              showResult={showResult}
              isCorrect={isCorrect}
              isSelectedWrong={isSelectedWrong}
            />
          );
        })}
      </div>

      {showResult ? (
        <div className="explanation-block">
          <p>
            <strong>Correct answer:</strong> {result?.correctAnswer}
          </p>
          <p>
            <strong>Why:</strong> {result?.explanation}
          </p>
          {!result?.isCorrect && result?.wrongExplanation ? (
            <p>
              <strong>Why your choice was incorrect:</strong> {result.wrongExplanation}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
};

export default QuestionCard;