import { DIFFICULTIES } from '../data/passages'

const difficultyDetails = (difficulty) => {
  if (!difficulty) return null
  const item = DIFFICULTIES.find((candidate) => candidate.value === difficulty)
  const friendlyNames = { BEGINNER: 'Turtle level', INTERMEDIATE: 'Rabbit level', ADVANCED: 'Horse level', EXPERT: 'Cheetah level' }
  return {
    level: difficulty.charAt(0) + difficulty.slice(1).toLowerCase(),
    friendlyName: item ? friendlyNames[difficulty] : null,
  }
}

const hasValue = (value) => value !== null && value !== undefined && value !== ''

const coachingMessage = (recommendation) => {
  const accuracy = Number(recommendation?.metrics?.accuracy)
  const wpmGap = Number(recommendation?.metrics?.wpmGap)
  if (accuracy >= 98) return 'Excellent accuracy. You are ready for a harder passage.'
  if (accuracy >= 94 && wpmGap <= 5) return 'Good speed. Continue at this level and reduce mistakes.'
  if (accuracy > 0 && accuracy < 90) return 'Slow down slightly and focus on clean keystrokes.'
  if (accuracy > 0) return 'Your accuracy is improving. Repeat this level once more.'
  return 'A focused next practice is ready.'
}

function CoachRecommendation({ recommendation, onContinue, onPracticeAgain, onChooseAnother }) {
  if (!recommendation) {
    return (
      <section className="coach-card coach-empty" aria-labelledby="coach-heading">
        <h2 id="coach-heading">Your next practice</h2>
        <p>Complete another session to receive personalised recommendations.</p>
      </section>
    )
  }

  const difficulty = difficultyDetails(recommendation.nextDifficulty)
  const hasRecommendationDetails = difficulty || hasValue(recommendation.suggestedCategory) || hasValue(recommendation.suggestedDuration)

  return (
    <section className="coach-card" aria-labelledby="coach-heading">
      <div className="coach-card-copy">
        <p className="eyebrow">Coach recommendation</p>
        <h2 id="coach-heading">Your next best step</h2>
        <p className="coach-message">{coachingMessage(recommendation)}</p>
      </div>
      {hasRecommendationDetails && (
        <div className="coach-next-practice">
          <h3>Next practice</h3>
          <dl className="coach-plan">
            {difficulty && <div><dt>Recommended difficulty</dt><dd>{difficulty.level}</dd></div>}
            {difficulty?.friendlyName && <div><dt>Friendly level name</dt><dd>{difficulty.friendlyName}</dd></div>}
            {hasValue(recommendation.suggestedCategory) && <div><dt>Recommended category</dt><dd>{recommendation.suggestedCategory}</dd></div>}
            {hasValue(recommendation.suggestedDuration) && <div><dt>Recommended duration</dt><dd>{Number(recommendation.suggestedDuration)} seconds</dd></div>}
          </dl>
        </div>
      )}
      {hasValue(recommendation.explanation) && <div className="coach-reason"><strong>Reason</strong><p>{recommendation.explanation}</p></div>}
      <div className="coach-actions">
        {hasRecommendationDetails && <button className="button button-primary" type="button" onClick={onContinue}>Continue Recommended Practice</button>}
        <button className="button button-secondary" type="button" onClick={onPracticeAgain}>Practice Again</button>
        <button className="button button-tertiary" type="button" onClick={onChooseAnother}>Choose Another Practice</button>
      </div>
    </section>
  )
}

export default CoachRecommendation
