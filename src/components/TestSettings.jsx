function TestSettings({ difficulty, testMode, onDifficultyChange, onTestModeChange, onNewPassage, disabled }) {
  return (
    <section className="test-settings" aria-labelledby="settings-heading">
      <div>
        <p className="eyebrow">Test settings</p>
        <h3 id="settings-heading">Choose your challenge</h3>
      </div>
      <div className="settings-controls">
        <label>
          <span>Difficulty</span>
          <select value={difficulty} onChange={onDifficultyChange} disabled={disabled}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="programming">Programming</option>
          </select>
        </label>
        <label>
          <span>Test mode</span>
          <select value={testMode} onChange={onTestModeChange} disabled={disabled}>
            <option value="complete">Complete Passage</option>
            <option value="30">30 Seconds</option>
            <option value="60">60 Seconds</option>
            <option value="120">120 Seconds</option>
          </select>
        </label>
        <button className="button button-secondary new-passage-button" type="button" onClick={onNewPassage} disabled={disabled}>
          New Passage
        </button>
      </div>
    </section>
  )
}

export default TestSettings
