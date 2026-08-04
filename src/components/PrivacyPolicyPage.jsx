import { useEffect } from 'react'
import SiteFooter from './SiteFooter'

const PRIVACY_TITLE = 'Privacy Policy – Typing Coach'
const PRIVACY_DESCRIPTION = 'Read the Typing Coach privacy policy, including how local typing progress, anonymous analytics, cookies, and typing analysis are handled.'

function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = PRIVACY_TITLE
    document.querySelector('meta[name="description"]')?.setAttribute('content', PRIVACY_DESCRIPTION)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://typing-ui.vercel.app/privacy')
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', PRIVACY_TITLE)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', PRIVACY_DESCRIPTION)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', 'https://typing-ui.vercel.app/privacy')
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', PRIVACY_TITLE)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', PRIVACY_DESCRIPTION)
  }, [])

  return (
    <div className="app-page legal-page">
      <a className="skip-link" href="#privacy-content">Skip to main content</a>
      <header className="about-header">
        <div className="content-shell about-header-inner">
          <a className="about-brand" href="/">Typing Coach</a>
          <a className="button button-secondary" href="/#typing-test">Start Practicing</a>
        </div>
      </header>

      <main id="privacy-content" className="content-shell legal-main" tabIndex="-1">
        <div className="legal-intro">
          <p className="eyebrow">Your privacy</p>
          <h1>Privacy Policy</h1>
          <p>Last updated: August 4, 2026</p>
        </div>

        <div className="legal-content">
          <section aria-labelledby="no-account">
            <h2 id="no-account">No Account Required</h2>
            <p>Typing Coach does not require a login or registration. You can use the typing practice experience without creating an account or providing your name, email address, or other directly identifying information.</p>
          </section>

          <section aria-labelledby="typing-data">
            <h2 id="typing-data">Typing Results and Analysis</h2>
            <p>Your saved settings, recommendations, progress summary, and completed typing results remain on your device in browser storage. When you request analysis, the current passage, your typed text, and session timing are sent to the Typing Coach analysis service to calculate feedback. Typing Coach does not use this information to create a personal profile.</p>
            <p>If cloud-based accounts or synchronisation are introduced in the future, this policy will be updated before those features begin storing progress remotely.</p>
          </section>

          <section aria-labelledby="analytics">
            <h2 id="analytics">Anonymous Analytics</h2>
            <p>Typing Coach may collect anonymous, aggregated analytics to understand general usage, performance, and reliability. These insights are intended to improve the product and are not used to identify individual users.</p>
          </section>

          <section aria-labelledby="cookies">
            <h2 id="cookies">Cookies</h2>
            <p>Typing Coach uses cookies only when they are technically required for the website or a future feature to function securely. The current practice experience relies primarily on local browser storage. This policy will be updated if optional cookies are introduced.</p>
          </section>

          <section aria-labelledby="policy-updates">
            <h2 id="policy-updates">Policy Updates</h2>
            <p>This policy may be revised as Typing Coach develops. Material changes will be reflected on this page with an updated effective date.</p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default PrivacyPolicyPage
