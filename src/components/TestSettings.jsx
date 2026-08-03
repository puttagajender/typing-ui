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
  disabled,
}) {
  return (
    <section className="test-settings" aria-labelledby="settings-heading">
      <div className="settings-heading">
        <p className="eyebrow">Choose practice</p>
        <h2 id="settings-heading">Practice settings</h2>
      </div>
      <div className="settings-controls">
        <label>
          <span>Level</span>
          <select value={difficulty} onChange={onDifficultyChange} disabled={disabled}>
            {DIFFICULTIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={onCategoryChange} disabled={disabled}>
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Duration</span>
          <select value={testMode} onChange={onTestModeChange} disabled={disabled}>
            {TEST_MODES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {testMode === 'custom' && (
          <label className="custom-duration-field">
            <span>Custom seconds</span>
            <input
              type="number"
              min="15"
              max="300"
              value={customDuration}
              onChange={onCustomDurationChange}
              disabled={disabled}
            />
          </label>
        )}
        <button className="button button-secondary new-passage-button" type="button" onClick={onNewPassage} disabled={disabled}>
          New Passage
        </button>
      </div>
    </section>
  )
}

export default TestSettings
