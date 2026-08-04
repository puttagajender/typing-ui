function ErrorMessage({ message, onRetry, onRestart }) {
  if (!message) return null

  return (
    <div className="notification notification-error" role="alert">
      <span className="notification-icon" aria-hidden="true">!</span>
      <div>
        <strong>We couldn&apos;t prepare your improvement insights right now.</strong>
        <span>{message}</span>
        <div className="error-actions">
          {onRetry && <button className="button button-primary" type="button" onClick={onRetry}>Retry Analysis</button>}
          {onRestart && <button className="button button-secondary" type="button" onClick={onRestart}>Restart Test</button>}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
