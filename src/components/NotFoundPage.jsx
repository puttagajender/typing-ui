import { useEffect } from 'react'
import SiteFooter from './SiteFooter'

function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found – Typing Coach'
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, follow')
  }, [])

  return (
    <div className="app-page not-found-page">
      <a className="skip-link" href="#not-found-content">Skip to main content</a>
      <header className="about-header">
        <div className="content-shell about-header-inner">
          <a className="about-brand" href="/">Typing Coach</a>
          <a className="button button-secondary" href="/#typing-test">Start Practicing</a>
        </div>
      </header>

      <main id="not-found-content" className="content-shell not-found-main" tabIndex="-1">
        <div className="not-found-card">
          <p className="eyebrow">404 error</p>
          <h1>Page Not Found</h1>
          <p>The page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
          <div className="not-found-actions">
            <a className="button button-primary" href="/">Go to Home</a>
            <a className="button button-secondary" href="/#typing-test">Start Typing</a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default NotFoundPage
