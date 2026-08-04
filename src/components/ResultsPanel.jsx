import { forwardRef } from 'react'

const hasOwnValue = (result, property) =>
  Object.prototype.hasOwnProperty.call(result, property) && result[property] !== null && result[property] !== undefined

const formatDecimal = (result, property, suffix = '') => {
  if (!hasOwnValue(result, property)) return 'Not available'
  return `${Number(result[property]).toFixed(1)}${suffix}`
}

const formatCount = (result, property) => {
  if (!hasOwnValue(result, property)) return 'Not available'
  return Math.round(Number(result[property])).toString()
}

const ResultsPanel = forwardRef(function ResultsPanel({ result }, ref) {
  const correctWpmProperty = hasOwnValue(result, 'correctWpm') ? 'correctWpm' : 'wpm'
  const primaryMetrics = [
    ['Accuracy', formatDecimal(result, 'accuracy', '%')],
    ['Total Mistakes', formatCount(result, 'mistakeCount')],
    ['Gross WPM', formatDecimal(result, 'grossWpm')],
  ]
  const secondaryMetrics = [
    ['Wrong Characters', formatCount(result, 'wrongCharacterCount')],
    ['Missing Characters', formatCount(result, 'missingCharacterCount')],
    ['Extra Characters', formatCount(result, 'extraCharacterCount')],
    ['Duration', formatDecimal(result, 'durationInSeconds', ' seconds')],
  ]

  return (
    <section ref={ref} className="results-panel" aria-labelledby="results-heading" tabIndex="-1">
      <div className="results-topline">
        <p className="eyebrow">Test complete</p>
        <h2 id="results-heading">Your results</h2>
      </div>

      <div className="result-overview">
        <dl className="result-hero" data-primary-metric="true">
          <div><dt>Correct WPM</dt><dd>{formatDecimal(result, correctWpmProperty)}</dd></div>
          <span>words per minute</span>
        </dl>
        <dl className="result-key-metrics" aria-label="Key results">
          {primaryMetrics.map(([label, value]) => (
            <div className="result-key-metric" key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      </div>

      <div className="result-details">
        <h3>Details</h3>
        <dl className="result-secondary-metrics">
          {secondaryMetrics.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  )
})

export default ResultsPanel
