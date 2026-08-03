import { forwardRef } from 'react'

const hasOwnValue = (result, property) =>
  Object.prototype.hasOwnProperty.call(result, property) && result[property] !== null && result[property] !== undefined

const formatDecimal = (result, property, suffix = '') => {
  if (!Object.prototype.hasOwnProperty.call(result, property)) return '—'
  if (result[property] === null || result[property] === undefined) return 'Not available'
  return `${Number(result[property]).toFixed(1)}${suffix}`
}

const formatCount = (result, property) => {
  if (!Object.prototype.hasOwnProperty.call(result, property)) return '—'
  if (result[property] === null || result[property] === undefined) return 'Not available'
  return Math.round(Number(result[property])).toString()
}

const getSummary = (accuracy) => {
  if (accuracy >= 98) return 'Excellent accuracy — now focus on speed.'
  if (accuracy >= 90) return 'Good progress — reduce small typing mistakes.'
  return 'Accuracy needs improvement — slow down and focus on correct keys.'
}

const ResultsPanel = forwardRef(function ResultsPanel({ result }, ref) {
  const correctWpmProperty = hasOwnValue(result, 'correctWpm') ? 'correctWpm' : 'wpm'
  const metrics = [
    ['Correct WPM', formatDecimal(result, correctWpmProperty)],
    ['Gross WPM', formatDecimal(result, 'grossWpm')],
    ['Accuracy', formatDecimal(result, 'accuracy', '%')],
    ['Duration', formatDecimal(result, 'durationInSeconds', ' seconds')],
    ['Total Mistakes', formatCount(result, 'mistakeCount')],
    ['Wrong Characters', formatCount(result, 'wrongCharacterCount')],
    ['Missing Characters', formatCount(result, 'missingCharacterCount')],
    ['Extra Characters', formatCount(result, 'extraCharacterCount')],
  ]
  const summary = hasOwnValue(result, 'accuracy') ? getSummary(Number(result.accuracy)) : null

  return (
    <section ref={ref} className="results-panel" aria-labelledby="results-heading" tabIndex="-1">
      <div className="results-topline">
        <div className="results-heading">
          <p className="eyebrow">Test complete</p>
          <h2 id="results-heading">Your results</h2>
          {summary && <p className="result-summary">{summary}</p>}
        </div>
      </div>
      <dl className="result-grid">
        {metrics.map(([label, value], index) => (
          <div className={`result-card${index < 2 ? ' result-card-featured' : ''}`} key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
})

export default ResultsPanel
