function LandingHero() {
  const scrollToTest = () => {
    document.getElementById('typing-test')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="landing-hero">
      <div className="content-shell hero-layout">
        <div className="hero-copy">
          <p className="eyebrow">Accuracy first. Speed follows.</p>
          <h1>Typing Coach</h1>
          <p className="hero-subtitle">
            Build reliable Touch Typing habits with a focused Typing Speed Test that measures your WPM,
            Typing Accuracy, and mistakes.
          </p>
          <button className="button button-primary hero-cta" type="button" onClick={scrollToTest}>
            Start Typing Test
          </button>
        </div>
        <div className="hero-preview" aria-hidden="true">
          <div className="preview-toolbar"><span /><span /><span /></div>
          <p><mark>Practice</mark> a little every day to build <em>speed</em> and accuracy.</p>
          <div className="preview-stats">
            <span><strong>42.3</strong> WPM</span>
            <span><strong>98.6%</strong> Accuracy</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default LandingHero
