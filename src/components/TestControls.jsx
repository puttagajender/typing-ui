function TestControls({ hasStarted, isSubmitting, hasResult, onFinish, onRestart }) {
  return (
    <div className="test-controls">
      <button
        className="button button-primary"
        type="button"
        onClick={onFinish}
        disabled={!hasStarted || isSubmitting || hasResult}
      >
        Finish Test
      </button>
      <button className="button button-secondary" type="button" onClick={onRestart} disabled={isSubmitting}>
        Restart Test
      </button>
    </div>
  )
}

export default TestControls
