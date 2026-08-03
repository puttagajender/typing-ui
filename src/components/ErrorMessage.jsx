function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <div className="notification notification-error" role="alert">
      <span className="notification-icon" aria-hidden="true">!</span>
      <div>
        <strong>We couldn’t analyse this attempt.</strong>
        <span>{message}</span>
      </div>
    </div>
  )
}

export default ErrorMessage
