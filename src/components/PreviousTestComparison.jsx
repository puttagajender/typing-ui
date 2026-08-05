import { compareSessions } from '../services/previousSessionStorage'

const comparisonMetrics = [
  { key: 'correctWpm', label: 'Correct WPM', suffix: '', lowerIsBetter: false },
  { key: 'accuracy', label: 'Accuracy', suffix: '%', lowerIsBetter: false },
  { key: 'mistakeCount', label: 'Mistakes', suffix: '', lowerIsBetter: true },
  { key: 'grossWpm', label: 'Gross WPM', suffix: '', lowerIsBetter: false },
]

const trendDetails = (value, lowerIsBetter) => {
  if (Math.abs(value) < 0.05) return { indicator: '▬', label: 'No change', style: 'neutral' }
  const increased = value > 0
  const improved = lowerIsBetter ? !increased : increased
  return {
    indicator: increased ? '▲' : '▼',
    label: increased ? 'Increased' : 'Decreased',
    style: improved ? 'improved' : 'declined',
  }
}

const formattedDelta = (value, suffix) => {
  const displayValue = Math.abs(value) < 0.05 ? 0 : value
  const rounded = suffix ? displayValue.toFixed(1) : Number.isInteger(displayValue) ? displayValue.toString() : displayValue.toFixed(1)
  return `${displayValue > 0 ? '+' : ''}${rounded}${suffix}`
}

function PreviousTestComparison({ currentSession, previousSession }) {
  const comparison = compareSessions(currentSession, previousSession)

  return (
    <section className="previous-test-comparison" aria-labelledby="comparison-heading">
      <h2 id="comparison-heading">Compared with your previous session</h2>
      {!comparison ? (
        <p className="comparison-first-session">This is your first completed session.</p>
      ) : (
        <>
          <dl className="comparison-metrics">
            {comparisonMetrics.map(({ key, label, suffix, lowerIsBetter }) => {
              const trend = trendDetails(comparison[key], lowerIsBetter)
              return (
                <div className={`comparison-metric comparison-${trend.style}`} key={key}>
                  <dt>{label}</dt>
                  <dd aria-label={`${label}: ${trend.label} by ${Math.abs(comparison[key]).toFixed(suffix ? 1 : Number.isInteger(comparison[key]) ? 0 : 1)}${suffix}`}>
                    <span aria-hidden="true">{trend.indicator}</span> {formattedDelta(comparison[key], suffix)}
                  </dd>
                </div>
              )
            })}
          </dl>
          {comparison.hasDifferentConfiguration && <p className="comparison-configuration-note">Comparison is based on a different practice configuration.</p>}
        </>
      )}
    </section>
  )
}

export default PreviousTestComparison
