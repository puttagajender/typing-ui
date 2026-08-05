const githubUrl = 'https://github.com/puttagajender/typing-ui'

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="content-shell footer-layout">
        <div className="footer-brand">
          <strong>Typing Coach</strong>
        </div>

        <nav className="footer-navigation" aria-label="Footer navigation">
          <div className="footer-group">
            <h2>Product</h2>
            <a href="/#typing-test">Practice Typing</a>
            <a href="/learn">Build Muscle Memory</a>
          </div>
          <div className="footer-group">
            <h2>Resources</h2>
            <a href="/about">About</a>
            <a href="/#typing-faq">FAQ</a>
            <a href={`${githubUrl}/issues`} target="_blank" rel="noreferrer">Contact</a>
          </div>
          <div className="footer-group">
            <h2>Legal</h2>
            <a href="/privacy">Privacy Policy</a>
            <span aria-disabled="true">Terms of Use</span>
          </div>
          <div className="footer-group">
            <h2>Social</h2>
            <a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>
            <span aria-disabled="true">LinkedIn <small>Placeholder</small></span>
          </div>
        </nav>
      </div>

      <div className="content-shell footer-bottom">
        <span>© 2026 Typing Coach</span>
        <span>Helping people master touch typing.</span>
      </div>
    </footer>
  )
}

export default SiteFooter
