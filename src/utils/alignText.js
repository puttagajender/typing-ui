export const COMPARISON_TYPES = {
  MATCH: 'MATCH',
  WRONG_CHARACTER: 'WRONG_CHARACTER',
  MISSING_CHARACTER: 'MISSING_CHARACTER',
  EXTRA_CHARACTER: 'EXTRA_CHARACTER',
}

const normalizeType = (item) => item.type ?? item.mistakeType ?? item.comparisonType

// Align the typed text to the most likely original-text prefix. Characters after
// that prefix stay untyped rather than being treated as missing.
export function alignText(originalText, typedText) {
  const original = Array.from(originalText)
  const typed = Array.from(typedText)
  const rows = typed.length + 1
  const columns = original.length + 1
  const costs = Array.from({ length: rows }, () => Array(columns).fill(0))

  for (let typedIndex = 0; typedIndex < rows; typedIndex += 1) costs[typedIndex][0] = typedIndex
  for (let originalIndex = 0; originalIndex < columns; originalIndex += 1) costs[0][originalIndex] = originalIndex

  for (let typedIndex = 1; typedIndex < rows; typedIndex += 1) {
    for (let originalIndex = 1; originalIndex < columns; originalIndex += 1) {
      const substitutionCost = typed[typedIndex - 1] === original[originalIndex - 1] ? 0 : 1
      costs[typedIndex][originalIndex] = Math.min(
        costs[typedIndex - 1][originalIndex - 1] + substitutionCost,
        costs[typedIndex - 1][originalIndex] + 1,
        costs[typedIndex][originalIndex - 1] + 1,
      )
    }
  }

  let consumedOriginal = 0
  for (let originalIndex = 1; originalIndex < columns; originalIndex += 1) {
    if (costs[typed.length][originalIndex] <= costs[typed.length][consumedOriginal]) {
      consumedOriginal = originalIndex
    }
  }

  const operations = []
  let typedIndex = typed.length
  let originalIndex = consumedOriginal

  while (typedIndex > 0 || originalIndex > 0) {
    const expected = original[originalIndex - 1]
    const actual = typed[typedIndex - 1]

    if (
      typedIndex > 0 &&
      originalIndex > 0 &&
      actual === expected &&
      costs[typedIndex][originalIndex] === costs[typedIndex - 1][originalIndex - 1]
    ) {
      operations.push({ type: COMPARISON_TYPES.MATCH, expectedCharacter: expected, typedCharacter: actual, originalIndex: originalIndex - 1 })
      typedIndex -= 1
      originalIndex -= 1
    } else if (
      typedIndex > 0 &&
      originalIndex > 0 &&
      costs[typedIndex][originalIndex] === costs[typedIndex - 1][originalIndex - 1] + 1
    ) {
      operations.push({ type: COMPARISON_TYPES.WRONG_CHARACTER, expectedCharacter: expected, typedCharacter: actual, originalIndex: originalIndex - 1 })
      typedIndex -= 1
      originalIndex -= 1
    } else if (typedIndex > 0 && costs[typedIndex][originalIndex] === costs[typedIndex - 1][originalIndex] + 1) {
      operations.push({ type: COMPARISON_TYPES.EXTRA_CHARACTER, typedCharacter: actual, originalIndex })
      typedIndex -= 1
    } else {
      operations.push({ type: COMPARISON_TYPES.MISSING_CHARACTER, expectedCharacter: expected, originalIndex: originalIndex - 1 })
      originalIndex -= 1
    }
  }

  operations.reverse()
  for (let index = consumedOriginal; index < original.length; index += 1) {
    operations.push({ type: 'UNTYPED', expectedCharacter: original[index], originalIndex: index })
  }

  if (typed.length < original.length) {
    const current = operations.find((item) => item.type === 'UNTYPED')
    if (current) current.type = 'CURRENT'
  }

  return operations
}

export function getComparison(originalText, typedText, backendItems) {
  const aligned = alignText(originalText, typedText)
  if (!Array.isArray(backendItems) || backendItems.length === 0) return aligned

  const normalizedItems = backendItems.map((item) => ({
    ...item,
    type: normalizeType(item),
    originalIndex: item.originalIndex ?? item.position,
  }))

  // A full backend comparison includes matches and is authoritative.
  if (normalizedItems.some((item) => item.type === COMPARISON_TYPES.MATCH)) {
    return normalizedItems
  }

  // Existing backends may return mistake-only details. Overlay those exact
  // classifications while retaining locally aligned matches and untyped text.
  normalizedItems.forEach((backendItem) => {
    const matchingIndex = aligned.findIndex((item) =>
      item.originalIndex === backendItem.originalIndex &&
      (backendItem.type !== COMPARISON_TYPES.EXTRA_CHARACTER || item.type === COMPARISON_TYPES.EXTRA_CHARACTER),
    )

    if (matchingIndex >= 0) {
      aligned[matchingIndex] = { ...aligned[matchingIndex], ...backendItem }
    }
  })

  return aligned
}

export function getAttemptedOriginalText(originalText, typedText) {
  if (!typedText) return ''

  const attemptedOperations = alignText(originalText, typedText).filter((item) =>
    item.type !== 'UNTYPED' && item.type !== 'CURRENT',
  )
  const lastOriginalIndex = attemptedOperations.reduce(
    (highest, item) => Math.max(highest, item.originalIndex ?? -1),
    -1,
  )

  return originalText.slice(0, lastOriginalIndex + 1)
}
