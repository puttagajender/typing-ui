import { DIFFICULTIES } from '../data/passages'

const difficultyLabel = (difficulty) =>
  DIFFICULTIES.find((item) => item.value === difficulty)?.label ?? difficulty

function CoachRecommendation({ recommendation, onContinue, onPracticeAgain }) {
  return (
    <section className="coach-card" aria-labelledby="coach-heading">
      <div className="coach-card-copy">
        <p className="eyebrow">Coach recommendation</p>
        <h2 id="coach-heading">Your next best step</h2>
        <p className="coach-explanation">{recommendation.explanation}</p>
      </div>
      <dl className="coach-plan">
        <div><dt>Next difficulty</dt><dd>{difficultyLabel(recommendation.nextDifficulty)}</dd></div>
        <div><dt>Suggested duration</dt><dd>{recommendation.suggestedDuration} seconds</dd></div>
        <div><dt>Suggested category</dt><dd>{recommendation.suggestedCategory}</dd></div>
      </dl>
      <div className="coach-actions">
        <button className="button button-primary" type="button" onClick={onContinue}>Continue Recommended Practice</button>
        <button className="button button-secondary" type="button" onClick={onPracticeAgain}>Practice Again</button>
      </div>
    </section>
  )
}

export default CoachRecommendation
