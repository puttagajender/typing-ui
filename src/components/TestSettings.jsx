import { memo } from 'react'
import { CATEGORIES, DIFFICULTIES, TEST_MODES } from '../data/passages'

function TestSettings({
  difficulty,
  category,
  testMode,
  customDuration,
  onDifficultyChange,
  onCategoryChange,
  onTestModeChange,
  onCustomDurationChange,
  onNewPassage,
  recommendation,
  customDurationError,
  disabled,
}) {
  const recommendedMode = recommendation?.suggestedDuration == null ? null : String(recommendation.suggestedDuration)
  const fieldLabel = (label, recommended) => (
    <span className="setting-label"><span>{label}</span>{recommended && <small>Recommended</small>}</span>
  )

  return (
    <section className="test-settings" aria-labelledby="settings-heading">
      <div className="settings-heading">
        <p className="eyebrow">Choose practice</p>
        <h2 id="settings-heading">Practice settings</h2>
      </div>
      <div className="settings-controls">
        <label>
          {fieldLabel('Level', recommendation?.nextDifficulty === difficulty)}
          <select aria-label="Level" value={difficulty} onChange={onDifficultyChange} disabled={disabled}>
            {DIFFICULTIES.map((item, index) => {
              const friendlyNames = ['Turtle', 'Rabbit', 'Horse', 'Cheetah']
              const readableName = item.value.charAt(0) + item.value.slice(1).toLowerCase()
              return <option key={item.value} value={item.value}>{readableName} — {friendlyNames[index]} level</option>
            })}
          </select>
        </label>
        <label>
          {fieldLabel('Practice topic', recommendation?.suggestedCategory === category)}
          <select aria-label="Practice topic" value={category} onChange={onCategoryChange} disabled={disabled}>
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          {fieldLabel('Test length', recommendedMode === testMode)}
          <select aria-label="Test length" value={testMode} onChange={onTestModeChange} disabled={disabled}>
            {TEST_MODES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {testMode === 'custom' && (
          <label className="custom-duration-field">
            <span>Custom seconds</span>
            <input
              aria-label="Custom seconds"
              type="number"
              min="15"
              max="300"
              value={customDuration}
              onChange={onCustomDurationChange}
              disabled={disabled}
              aria-invalid={Boolean(customDurationError)}
              aria-describedby={customDurationError ? 'custom-duration-error' : 'custom-duration-help'}
            />
            {customDurationError
              ? <small id="custom-duration-error" className="field-error" role="alert">{customDurationError}</small>
              : <small id="custom-duration-help" className="field-help">15–300 seconds</small>}
          </label>
        )}
        <button className="button button-secondary new-passage-button" type="button" onClick={onNewPassage} disabled={disabled}>
          New Passage
        </button>
      </div>
    </section>
  )
}

const settingsPropsAreEqual = (previous, next) =>
  previous.difficulty === next.difficulty
  && previous.category === next.category
  && previous.testMode === next.testMode
  && previous.customDuration === next.customDuration
  && previous.customDurationError === next.customDurationError
  && previous.recommendation === next.recommendation
  && previous.sessionVersion === next.sessionVersion
  && previous.disabled === next.disabled

export default memo(TestSettings, settingsPropsAreEqual)
