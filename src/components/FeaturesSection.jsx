const features = [
  ['01', 'Live feedback', 'See correct, incorrect, missing, and extra characters while you type.'],
  ['02', 'Clear WPM results', 'Complete a Typing Speed Test and review backend-calculated WPM and duration.'],
  ['03', 'Accuracy insights', 'Understand your Typing Accuracy with a simple breakdown of typing mistakes.'],
  ['04', 'Focused practice', 'Build Touch Typing consistency in a calm workspace without distractions.'],
]

function FeaturesSection() {
  return (
    <section className="landing-section content-shell" aria-labelledby="features-heading">
      <div className="section-heading">
        <p className="eyebrow">Built for better habits</p>
        <h2 id="features-heading">Everything you need for focused Typing Practice</h2>
      </div>
      <div className="feature-grid">
        {features.map(([number, title, description]) => (
          <article className="feature-card" key={title}>
            <span className="feature-number" aria-hidden="true">{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
