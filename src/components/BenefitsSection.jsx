const benefits = [
  ['Accuracy before speed', 'Reduce avoidable errors before pushing for a higher WPM.'],
  ['Confidence through clarity', 'Know exactly where wrong, missing, and extra characters occurred.'],
  ['Progress through repetition', 'Restart quickly and turn short practice sessions into a lasting routine.'],
]

function BenefitsSection() {
  return (
    <section className="benefits-band" aria-labelledby="benefits-heading">
      <div className="content-shell">
        <div className="section-heading section-heading-centered">
          <p className="eyebrow">Practice with purpose</p>
          <h2 id="benefits-heading">Small improvements that add up</h2>
        </div>
        <div className="benefit-grid">
          {benefits.map(([title, description]) => (
            <article className="benefit-card" key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection
