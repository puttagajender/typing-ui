import { memo } from 'react'
import { DIFFICULTIES } from '../data/passages'

const formatTime = (seconds) => {
  const totalSeconds = Math.round(seconds)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}

const todayKey = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function ProgressDashboard({ progress, difficulty }) {
  const level = DIFFICULTIES.find((item) => item.value === difficulty)?.label ?? difficulty
  const practicedToday = progress.lastPracticeDate === todayKey()
  const hasCompletedSession = progress.totalTestsCompleted > 0

  return (
    <section className="progress-dashboard" aria-labelledby="dashboard-heading">
      <div className="dashboard-heading">
        <p className="eyebrow">Local progress</p>
        <h2 id="dashboard-heading">Your dashboard</h2>
      </div>
      {!hasCompletedSession ? (
        <div className="progress-empty">
          <strong>Your progress will appear after your first completed session.</strong>
          <span>Complete a typing test to establish your starting point.</span>
        </div>
      ) : <div className="dashboard-grid">
        <article className="dashboard-card dashboard-summary">
          <h3>Today&apos;s Summary</h3>
          <strong>{practicedToday ? 'Practice complete' : 'Ready to practise'}</strong>
          <span>{progress.totalCharactersTyped.toLocaleString()} total characters · {progress.currentStreak} day streak</span>
        </article>
        <article className="dashboard-card"><h3>Best WPM</h3><strong>{progress.bestCorrectWpm.toFixed(1)}</strong><span>Gross {progress.bestGrossWpm.toFixed(1)}</span></article>
        <article className="dashboard-card"><h3>Average Accuracy</h3><strong>{progress.averageAccuracy.toFixed(1)}%</strong><span>Average WPM {progress.averageCorrectWpm.toFixed(1)}</span></article>
        <article className="dashboard-card"><h3>Tests Completed</h3><strong>{progress.totalTestsCompleted}</strong><span>Stored on this device</span></article>
        <article className="dashboard-card"><h3>Total Practice Time</h3><strong>{formatTime(progress.totalTypingTime)}</strong><span>Across completed tests</span></article>
        <article className="dashboard-card"><h3>Current Level</h3><strong className="dashboard-text-value">{level}</strong><span>Selected practice level</span></article>
      </div>}
    </section>
  )
}

export default memo(ProgressDashboard)
