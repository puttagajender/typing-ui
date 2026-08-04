import { normalizePracticeWords, normalizeWeakKeys } from '../utils/weakKeyPractice'

const formatMistakeType = (value) => {
  if (!value) return 'Not reported'
  return String(value).toLowerCase().replaceAll('_', ' ').replace(/^./, (character) => character.toUpperCase())
}

function WeakKeyCoach({ result, onPractice }) {
  const weakKeys = normalizeWeakKeys(result?.weakKeys)
  const practiceWords = normalizePracticeWords(result?.suggestedPracticeWords)
  const summary = typeof result?.weakKeySummary === 'string' && result.weakKeySummary.trim()
    ? result.weakKeySummary.trim()
    : null

  if (!weakKeys.length) {
    return <p className="weak-keys-positive" role="status">Your keystrokes were consistent. Continue with your recommended practice.</p>
  }

  return (
    <section className="weak-key-coach" aria-labelledby="weak-keys-heading">
      <div className="weak-key-heading">
        <p className="eyebrow">Focused feedback</p>
        <h2 id="weak-keys-heading">Keys to Improve</h2>
        {summary && <p>{summary}</p>}
      </div>
      <div className="weak-key-grid">
        {weakKeys.map((item, index) => (
          <article className="weak-key-card" key={`${item.character}-${index}`}>
            <strong className="weak-key-character">{String(item.character) === ' ' ? 'Space' : item.character}</strong>
            <dl>
              <div><dt>Mistakes</dt><dd>{Number.isFinite(item.mistakeCount) ? Math.round(item.mistakeCount) : 'Not reported'}</dd></div>
              <div><dt>Percentage</dt><dd>{Number.isFinite(item.mistakePercentage) ? `${item.mistakePercentage.toFixed(1)}%` : 'Not reported'}</dd></div>
              <div><dt>Type</dt><dd>{formatMistakeType(item.dominantMistakeType)}</dd></div>
            </dl>
          </article>
        ))}
      </div>

      {practiceWords.length > 0 && (
        <div className="practice-words">
          <h3>Recommended Practice Words</h3>
          <div className="word-chips" aria-label="Recommended practice words">
            {practiceWords.map((word) => <span key={word}>{word}</span>)}
          </div>
          <button className="button button-primary" type="button" onClick={() => onPractice(practiceWords)}>
            Practice Weak Keys
          </button>
        </div>
      )}
    </section>
  )
}

export default WeakKeyCoach
