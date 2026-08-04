const features = [
  {
    title: 'Learn',
    description: 'Step-by-step lessons designed to build muscle memory and proper finger positioning.',
    status: 'Coming Soon',
  },
  {
    title: 'Practice',
    description: 'Timed typing practice with multiple difficulty levels and categories.',
    status: 'Available',
  },
  {
    title: 'Improve',
    description: 'Receive detailed typing analysis including speed, accuracy and mistakes.',
    status: 'Available',
  },
  {
    title: 'Personal Coach',
    description: 'Get personalized recommendations for your next practice session based on your performance.',
    status: 'Available',
  },
]

function WhyTypingCoach() {
  return (
    <section className="why-typing-coach" aria-labelledby="why-typing-coach-heading">
      <div className="why-typing-coach-heading">
        <p className="eyebrow">Built for steady progress</p>
        <h2 id="why-typing-coach-heading">Why Typing Coach?</h2>
      </div>
      <div className="platform-feature-grid">
        {features.map(({ title, description, status }) => (
          <article className="platform-feature-card" key={title}>
            <div className="platform-feature-topline">
              <h3>{title}</h3>
              <span className={`feature-status ${status === 'Available' ? 'is-available' : 'is-planned'}`}>
                {status}
              </span>
            </div>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default WhyTypingCoach
