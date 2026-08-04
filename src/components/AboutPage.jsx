import { useEffect } from 'react'
import SiteFooter from './SiteFooter'

const ABOUT_TITLE = 'About Typing Coach – Our Mission for Better Typing'
const ABOUT_DESCRIPTION = 'Learn why Typing Coach was built, who it helps, and how focused practice, clear analysis, and personalised guidance support touch typing improvement.'

function AboutPage() {
  useEffect(() => {
    document.title = ABOUT_TITLE
    const description = document.querySelector('meta[name="description"]')
    const canonical = document.querySelector('link[rel="canonical"]')
    if (description) description.setAttribute('content', ABOUT_DESCRIPTION)
    if (canonical) canonical.setAttribute('href', 'https://typing-ui.vercel.app/about')
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', ABOUT_TITLE)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', ABOUT_DESCRIPTION)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', 'https://typing-ui.vercel.app/about')
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', ABOUT_TITLE)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', ABOUT_DESCRIPTION)
  }, [])

  return (
    <div className="app-page about-page">
      <a className="skip-link" href="#about-content">Skip to main content</a>
      <header className="about-header">
        <div className="content-shell about-header-inner">
          <a className="about-brand" href="/">Typing Coach</a>
          <a className="button button-secondary" href="/#typing-test">Start Practicing</a>
        </div>
      </header>

      <main id="about-content" className="content-shell about-main" tabIndex="-1">
        <div className="about-intro">
          <p className="eyebrow">About Typing Coach</p>
          <h1>Helping People Master Touch Typing</h1>
          <p>Typing Coach is a complete typing improvement platform built to make deliberate practice clear, focused, and useful.</p>
        </div>

        <div className="about-content-grid">
          <section aria-labelledby="why-built">
            <h2 id="why-built">Why Typing Coach Was Built</h2>
            <p>Most typing tools measure speed once and stop at a score. Typing Coach was built to support what happens next: understanding mistakes, choosing the right level, practising weak areas, and building accurate movements that last. The experience keeps distractions low so learners can concentrate on technique and steady progress.</p>
          </section>

          <section aria-labelledby="our-vision">
            <h2 id="our-vision">Our Vision</h2>
            <p>Our vision is to make confident touch typing an achievable skill for anyone who uses a keyboard. Typing Coach aims to connect learning, practice, analysis, and personalised guidance in one approachable platform—from the first home-row exercise to advanced professional goals.</p>
          </section>

          <section aria-labelledby="our-mission">
            <h2 id="our-mission">Our Mission</h2>
            <p>Our mission is to help people build accuracy before speed, develop lasting muscle memory, and understand their improvement over time. Every practice session should provide clear feedback and a practical next step without turning learning into noise or pressure.</p>
          </section>

          <section aria-labelledby="who-should-use">
            <h2 id="who-should-use">Who Should Use Typing Coach?</h2>
            <p>Typing Coach is designed for beginners learning finger placement, students developing digital skills, software developers working at a keyboard every day, office workers improving efficiency, and professionals who want faster, more accurate typing. Practice levels and topics make the experience useful across different goals and abilities.</p>
          </section>

          <section className="about-difference" aria-labelledby="what-makes-different">
            <h2 id="what-makes-different">More Than an Ordinary Typing Test</h2>
            <p>Ordinary typing tests usually report WPM and accuracy after one attempt. Typing Coach combines those measurements with character-level analysis, weak-key feedback, progress tracking, flexible practice settings, and recommendations for the next session. Instead of asking only “How fast did you type?”, it helps answer “What should you practise next?”</p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default AboutPage
