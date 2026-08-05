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
  if (accuracy >= 98) return 'Excellent accuracy. Build your skills with a harder passage.'
  if (accuracy >= 94 && wpmGap <= 5) return 'Strong pace. Stay at this level and refine your accuracy.'
  if (accuracy > 0 && accuracy < 90) return 'Build accuracy first with slower, cleaner keystrokes.'
  if (accuracy > 0) return 'Your accuracy is improving. Practice this level once more.'
  return 'Your personalized next practice is ready.'
}

function CoachRecommendation({ recommendation, onContinue, onPracticeAgain, onChooseAnother }) {
  if (!recommendation) {
    return (
      <section className="coach-card coach-empty" aria-labelledby="coach-heading">
        <h2 id="coach-heading">Your next practice</h2>
        <p>Complete your first typing session to unlock personalized recommendations.</p>
      </section>
    )
  }

  const difficulty = difficultyDetails(recommendation.nextDifficulty)
  const hasRecommendationDetails = difficulty || hasValue(recommendation.suggestedCategory) || hasValue(recommendation.suggestedDuration)

  return (
    <section className="coach-card" aria-labelledby="coach-heading">
      <div className="coach-card-copy">
        <h2 id="coach-heading">Coach Recommendation</h2>
        <p className="coach-message">{coachingMessage(recommendation)}</p>
      </div>
      {hasRecommendationDetails && (
        <div className="coach-next-practice">
          <h3>Next practice</h3>
          <p className="coach-plan-summary">
            {[difficulty?.level, recommendation.suggestedCategory, hasValue(recommendation.suggestedDuration) ? `${Number(recommendation.suggestedDuration)} Seconds` : null]
              .filter(Boolean)
              .join(' • ')}
          </p>
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
