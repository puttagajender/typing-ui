function LandingHero() {
  return (
    <header className="product-hero">
      <div className="content-shell product-hero-inner">
        <div className="product-hero-copy">
          <p className="eyebrow">Typing Coach</p>
          <h1>Master Touch Typing with Confidence</h1>
          <p className="product-hero-subtitle">
            Learn touch typing from beginner to advanced. Practice with intelligent recommendations, improve your accuracy, increase your typing speed and build lasting muscle memory.
          </p>
        </div>

        <div className="product-hero-footer">
          <div className="product-hero-actions">
            <a className="button button-primary" href="#typing-test">Start Practicing</a>
            <button className="button button-secondary" type="button" disabled>
              Build Muscle Memory <span className="coming-soon">Coming Soon</span>
            </button>
          </div>

          <ul className="product-benefits" aria-label="Typing Coach benefits">
            <li>Free Forever</li>
            <li>No Registration Required</li>
            <li>Instant Performance Analysis</li>
            <li>Personalized Practice Recommendations</li>
            <li>Beginner Friendly</li>
          </ul>
        </div>
      </div>
    </header>
  )
}

export default LandingHero
