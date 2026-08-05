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
  const referenceCharacters = Array.from(originalText)
  const characterTypes = referenceCharacters.map(() => 'UNTYPED')
  const extrasByPosition = new Map()

  comparison.forEach((item) => {
    if (item.type === COMPARISON_TYPES.EXTRA_CHARACTER) {
      const position = Math.max(0, Math.min(item.originalIndex ?? 0, referenceCharacters.length))
      const extras = extrasByPosition.get(position) ?? []
      extras.push(item.typedCharacter)
      extrasByPosition.set(position, extras)
    } else if (item.originalIndex >= 0 && item.originalIndex < referenceCharacters.length) {
      characterTypes[item.originalIndex] = item.type
    }
  })

  const renderExtraMarkers = (position) => (extrasByPosition.get(position) ?? []).map((character, index) => (
    <span
      aria-label={`Extra character ${character}`}
      className="extra-character-marker"
      data-comparison-type={COMPARISON_TYPES.EXTRA_CHARACTER}
      data-extra-character={character}
      key={`extra-${position}-${index}`}
      role="img"
    />
  ))

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
        {referenceCharacters.map((character, index) => (
          <span key={`reference-${index}`}>
            {renderExtraMarkers(index)}
            <span
              className={`passage-character ${styleByType[characterTypes[index]] ?? 'untyped'}`}
              data-comparison-type={characterTypes[index]}
              data-original-index={index}
            >
              {character}
            </span>
          </span>
        ))}
        {renderExtraMarkers(referenceCharacters.length)}
      </div>
    </div>
  )
}

export default TypingPassage
