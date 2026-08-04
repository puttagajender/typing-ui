import TestControls from './TestControls'
import TypingInput from './TypingInput'
import TypingPassage from './TypingPassage'

function PracticeSession({ category, comparisonItems, displayedTime, error, inputRef, isSubmitting, levelLabel, onFinish, onRestart, onTyping, originalText, result, testEnded, timedDuration, typedText }) {
  const progressPercentage = originalText.length
    ? Math.round((typedText.length / originalText.length) * 100)
    : 0

  return (
    <section className="practice-card" aria-labelledby="practice-heading" aria-busy={isSubmitting}>
      <div className="practice-heading-row">
        <div><p className="practice-context">{levelLabel} · {category}</p><h2 id="practice-heading">Practice passage</h2></div>
        <div className="live-stats" aria-label="Practice status">
          <span className="timer-stat"><strong>{displayedTime.toFixed(1)}</strong><small>{timedDuration ? 'seconds remaining' : 'seconds elapsed'}</small></span>
          <span><strong>{typedText.length} / {originalText.length}</strong><small>characters</small></span>
        </div>
      </div>
      {!originalText ? (
        <div className="practice-empty" role="status">
          <strong>No passage is available for these settings.</strong>
          <span>Choose another level or practice topic to continue.</span>
        </div>
      ) : (
        <>
          {!typedText && !result && <p className="start-prompt" role="status">Start typing to begin.</p>}
          <TypingPassage originalText={originalText} typedText={typedText} comparisonItems={comparisonItems} />
          <TypingInput ref={inputRef} value={typedText} onChange={onTyping} disabled={testEnded} maxLength={originalText.length} />
          <div className="progress-row"><span>Progress</span><span>{progressPercentage}%</span></div>
          <div className="typing-progress" role="progressbar" aria-label="Typing progress" aria-valuemin="0" aria-valuemax={originalText.length} aria-valuenow={typedText.length} aria-valuetext={`${progressPercentage}% complete`}>
            <span style={{ width: `${progressPercentage}%` }} />
          </div>
          {!error && <TestControls hasStarted={Boolean(typedText)} isSubmitting={isSubmitting} hasResult={Boolean(result)} onFinish={onFinish} onRestart={onRestart} />}
        </>
      )}
    </section>
  )
}

export default PracticeSession
