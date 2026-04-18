import { getScoreTone } from '../../utils/helpers.js';

const ScoreBadge = ({ score, total = 5 }) => {
  const tone = getScoreTone(score);
  const display = score === null || score === undefined ? 'Not taken' : `${score}/${total}`;

  return <span className={`score-badge score-${tone}`}>{display}</span>;
};

export default ScoreBadge;