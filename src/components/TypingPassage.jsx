import { COMPARISON_TYPES, getComparison } from '../utils/alignText'

const styleByType = {
  [COMPARISON_TYPES.MATCH]: 'correct',
  [COMPARISON_TYPES.WRONG_CHARACTER]: 'incorrect',
  [COMPARISON_TYPES.MISSING_CHARACTER]: 'missing',
  [COMPARISON_TYPES.EXTRA_CHARACTER]: 'extra',
  CURRENT: 'current',
  UNTYPED: 'untyped',
}

function TypingPassage({ originalText, typedText, comparisonItems }) {
  const comparison = getComparison(originalText, typedText, comparisonItems)

  return (
    <div className="passage-area">
      <div className="passage-legend" aria-label="Character highlighting legend">
        <span><i className="legend-swatch correct" aria-hidden="true" />Correct</span>
        <span><i className="legend-swatch incorrect" aria-hidden="true" />Wrong</span>
        <span><i className="legend-swatch missing" aria-hidden="true" />Missing</span>
        <span><i className="legend-swatch extra" aria-hidden="true" />Extra</span>
        <span><i className="legend-swatch current" aria-hidden="true" />Current</span>
        <span><i className="legend-swatch untyped" aria-hidden="true" />Untyped</span>
      </div>
      <div className="typing-passage" aria-label="Text to type" onClick={() => document.getElementById('typing-input')?.focus()}>
        {comparison.map((item, index) => {
          const style = styleByType[item.type] ?? 'untyped'
          const isExtra = item.type === COMPARISON_TYPES.EXTRA_CHARACTER
          const character = isExtra ? item.typedCharacter : item.expectedCharacter

          return (
            <span
              className={`passage-character ${style}`}
              data-comparison-type={item.type}
              key={`${item.originalIndex}-${item.type}-${index}`}
              aria-label={isExtra ? `Extra character ${character}` : undefined}
            >
              {character}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default TypingPassage
