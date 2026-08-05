function LandingHero() {
  return (
    <header className="product-hero">
      <div className="content-shell product-hero-inner">
        <div className="product-hero-copy">
          <p className="eyebrow">Typing Coach</p>
          <h1>Master Touch Typing with Confidence</h1>
          <p className="product-hero-subtitle">
            Typing Coach is a complete touch typing improvement platform for beginners and professionals. Go beyond a one-off speed score with focused practice, instant analysis, and personalized next steps that build accuracy, speed, and lasting muscle memory.
          </p>
        </div>

        <div className="product-hero-footer">
          <div className="product-hero-actions">
            <a className="button button-primary" href="#typing-test">Start Practicing</a>
            <a aria-label="New to touch typing? Build Muscle Memory →" className="beginner-entry" href="/learn"><span>New to touch typing?</span><strong>Build Muscle Memory →</strong></a>
            <p className="hero-next-step">Choose a level, type a passage, then follow your personalized next practice.</p>
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
