import { forwardRef } from 'react'

const METRIC_EXPLANATIONS = {
  'Correct WPM': 'The number of correctly typed words per minute.',
  Accuracy: 'Percentage of correctly typed characters.',
  'Gross WPM': 'Your overall typing speed before deducting mistakes.',
  CPM: 'The number of characters typed per minute.',
  Mistakes: 'The total number of typing mistakes.',
  'Wrong Characters': 'Characters typed differently from the passage.',
  'Missing Characters': 'Expected characters that were not typed.',
  'Extra Characters': 'Characters typed that were not in the passage.',
  Duration: 'The total time spent typing this attempt.',
}

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

const getCpm = (result) => {
  if (hasOwnValue(result, 'cpm')) return Number(result.cpm).toFixed(1)
  if (hasOwnValue(result, 'charactersPerMinute')) return Number(result.charactersPerMinute).toFixed(1)
  if (hasOwnValue(result, 'grossWpm')) return (Number(result.grossWpm) * 5).toFixed(1)
  return 'Not available'
}

function MetricLabel({ label }) {
  const tooltipId = `metric-${label.toLowerCase().replaceAll(' ', '-')}`
  return (
    <span className="metric-label">
      <span>{label}</span>
      <button className="metric-info" type="button" aria-label={`About ${label}`} aria-describedby={tooltipId}>i</button>
      <span className="metric-tooltip" id={tooltipId} role="tooltip">{METRIC_EXPLANATIONS[label]}</span>
    </span>
  )
}

function Metric({ label, value, className }) {
  return <div className={className}><dt><MetricLabel label={label} /></dt><dd>{value}</dd></div>
}

const ResultsPanel = forwardRef(function ResultsPanel({ result }, ref) {
  const correctWpmProperty = hasOwnValue(result, 'correctWpm') ? 'correctWpm' : 'wpm'
  const primaryMetrics = [
    ['Correct WPM', formatDecimal(result, correctWpmProperty)],
    ['Accuracy', formatDecimal(result, 'accuracy', '%')],
  ]
  const secondaryMetrics = [
    ['Gross WPM', formatDecimal(result, 'grossWpm')],
    ['CPM', getCpm(result)],
    ['Mistakes', formatCount(result, 'mistakeCount')],
    ['Wrong Characters', formatCount(result, 'wrongCharacterCount')],
    ['Missing Characters', formatCount(result, 'missingCharacterCount')],
    ['Extra Characters', formatCount(result, 'extraCharacterCount')],
    ['Duration', formatDecimal(result, 'durationInSeconds', ' seconds')],
  ]

  return (
    <section ref={ref} className="results-panel" aria-labelledby="results-heading" tabIndex="-1">
      <div className="results-topline"><p className="eyebrow">Test complete</p><h2 id="results-heading">Your results</h2></div>
      <dl className="result-primary-metrics" aria-label="Primary typing statistics">
        {primaryMetrics.map(([label, value]) => <Metric className="result-primary-metric" key={label} label={label} value={value} />)}
      </dl>
      <div className="result-details">
        <h3>Details</h3>
        <dl className="result-secondary-metrics" aria-label="Detailed typing statistics">
          {secondaryMetrics.map(([label, value]) => <Metric key={label} label={label} value={value} />)}
        </dl>
      </div>
    </section>
  )
})

export default ResultsPanel
