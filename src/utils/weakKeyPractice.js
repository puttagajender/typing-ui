export function normalizeWeakKeys(weakKeys) {
  if (!Array.isArray(weakKeys)) return []

  return weakKeys
    .map((item) => ({
      character: item?.character ?? item?.key ?? item?.weakKey,
      mistakeCount: Number(item?.mistakeCount ?? item?.count),
      mistakePercentage: Number(item?.mistakePercentage ?? item?.percentage),
      dominantMistakeType: item?.dominantMistakeType ?? item?.mistakeType,
    }))
    .filter((item) =>
      item.character !== null &&
      item.character !== undefined &&
      String(item.character).length > 0,
    )
    .slice(0, 5)
}

export function normalizePracticeWords(words) {
  if (!Array.isArray(words)) return []
  return [...new Set(words.filter((word) => typeof word === 'string').map((word) => word.trim()).filter(Boolean))]
}

export function buildWeakKeyPassage(words) {
  const practiceWords = normalizePracticeWords(words)
  if (!practiceWords.length) return ''

  const phrases = []
  let characterCount = 0
  let offset = 0
  while (characterCount < 180) {
    const arranged = practiceWords.map((_, index) => practiceWords[(index + offset) % practiceWords.length])
    const phrase = `${arranged.join(' ')}.`
    phrases.push(phrase)
    characterCount += phrase.length + 1
    offset = (offset + 1) % practiceWords.length
  }

  return phrases.join(' ')
}
