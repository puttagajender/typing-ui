import SiteFooter from './SiteFooter'
import { loadLearningProgress } from '../services/learningProgressStorage'

function LearnHome() {
  const progress = loadLearningProgress()
  const lessonOneCompleted = progress.completedLessonIds.includes('home-row')
  const lessonTwoCompleted = Boolean(progress.lessons['top-row-e-i']?.completed)
  const lessonThreeCompleted = Boolean(progress.lessons['bottom-row-c-n']?.completed)
  const lessonsCompleted = Number(lessonOneCompleted) + Number(lessonTwoCompleted) + Number(lessonThreeCompleted)
  const progressPercent = Math.round((lessonsCompleted / 3) * 100)

  return (
    <div className="app-page learn-page">
      <header className="learn-header">
        <div className="content-shell learn-header-inner">
          <a className="learn-back-link" href="/">← Back to Practice</a>
          <p className="eyebrow">Beginner learning module</p>
          <h1>Build Muscle Memory</h1>
          <p>Learn proper finger placement and touch typing step by step.</p>
        </div>
      </header>
      <main className="content-shell learn-main" id="main-content">
        <section className="learning-progress" aria-labelledby="learning-progress-heading">
          <h2 id="learning-progress-heading" className="sr-only">Learning progress</h2>
          <dl>
            <div><dt>Current stage</dt><dd>{lessonThreeCompleted ? 'C and N Complete' : lessonTwoCompleted ? 'Bottom Row Introduction' : lessonOneCompleted ? 'Top Row Introduction' : 'Finger Placement'}</dd></div>
            <div><dt>Lessons completed</dt><dd>{lessonsCompleted}</dd></div>
            <div><dt>Overall progress</dt><dd>{progressPercent}%</dd></div>
          </dl>
          <div className="learning-progress-bar" role="progressbar" aria-label="Overall learning progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressPercent}><span style={{ width: `${progressPercent}%` }} /></div>
        </section>

        <section className="lesson-card" aria-labelledby="lesson-one-heading">
          <div>
            <p className="eyebrow">Lesson 1 · 5 minutes</p>
            <h2 id="lesson-one-heading">Home Row Foundation</h2>
            <p>Learn where to place your fingers on A S D F and J K L ;.</p>
          </div>
          <a className="button button-primary" href="/learn/home-row">{lessonOneCompleted ? 'Review Lesson' : 'Start Lesson'}</a>
        </section>

        <section className={`lesson-card ${lessonOneCompleted ? '' : 'lesson-card-locked'}`} aria-labelledby="lesson-two-heading">
          <div>
            <p className="eyebrow">Lesson 2 · 7 minutes</p>
            <h2 id="lesson-two-heading">Top Row Introduction — E and I</h2>
            <p>Move your middle fingers from D to E and K to I, then return home.</p>
          </div>
          {lessonOneCompleted
            ? <a className="button button-primary" href="/learn/top-row-e-i">{lessonTwoCompleted ? 'Review Lesson' : 'Start Lesson 2'}</a>
            : <span className="lesson-lock-note">Complete Lesson 1 first</span>}
        </section>

        <section className={`lesson-card ${lessonTwoCompleted ? '' : 'lesson-card-locked'}`} aria-labelledby="lesson-three-heading">
          <div>
            <p className="eyebrow">Lesson 3 · 8 minutes</p>
            <h2 id="lesson-three-heading">Bottom Row Introduction — C and N</h2>
            <p>Move down from D to C and J to N while keeping the home row steady.</p>
          </div>
          {lessonTwoCompleted
            ? <a className="button button-primary" href="/learn/bottom-row-c-n">{lessonThreeCompleted ? 'Review Lesson' : 'Start Lesson 3'}</a>
            : <span className="lesson-lock-note">Complete Lesson 2 first</span>}
        </section>

        <section className="learn-outcomes" aria-labelledby="learn-outcomes-heading">
          <h2 id="learn-outcomes-heading">What you will learn</h2>
          <ul>
            <li>Correct finger placement</li>
            <li>F and J guide-key bumps</li>
            <li>Returning fingers to the home row</li>
            <li>Accuracy before speed</li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

export default LearnHome
