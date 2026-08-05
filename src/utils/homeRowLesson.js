export const GUIDED_EXERCISES = ['f j f j', 'd k d k', 's l s l', 'a ; a ;']
export const HOME_ROW_EXERCISES = ['asdf jkl;', 'fdsa ;lkj', 'asdf fdsa', 'jkl; ;lkj']
export const WORD_EXERCISES = ['sad', 'dad', 'fall', 'ask', 'all', 'lad', 'flask']

const HOME_ROW_WORDS = ['sad', 'dad', 'fall', 'ask', 'all', 'lad', 'flask']
const PAIR_PARTNERS = { a: 's', s: 'a', d: 's', f: 'd', j: 'k', k: 'j', l: 'k', ';': 'l' }

export function calculateAccuracy(correctCharacters, totalCharacters) {
  if (totalCharacters <= 0) return 100
  return (correctCharacters / totalCharacters) * 100
}

export function evaluateHomeRowMastery({ accuracy, guidedExercisesCompleted, mistakesByKey }) {
  const weakKeys = Object.entries(mistakesByKey)
    .filter(([, count]) => count >= 3)
    .sort((first, second) => second[1] - first[1])
    .map(([key]) => key)

  return {
    passed: accuracy >= 95 && guidedExercisesCompleted >= 2 && weakKeys.length === 0,
    weakKeys,
  }
}

export function generateRepairDrill(key) {
  const normalizedKey = typeof key === 'string' && 'asdfjkl;'.includes(key.toLowerCase()) ? key.toLowerCase() : 'f'
  const partner = PAIR_PARTNERS[normalizedKey]
  const words = HOME_ROW_WORDS.filter((word) => word.includes(normalizedKey)).slice(0, 2)
  const fallbackWord = normalizedKey === ';' ? `l; ;l` : `${normalizedKey}${partner}${normalizedKey}`

  return [
    `${normalizedKey} ${normalizedKey} ${normalizedKey} ${normalizedKey} ${normalizedKey}`,
    `${partner}${normalizedKey} ${normalizedKey}${partner}`,
    ...(words.length ? words.map((word) => `${word} ${word}`) : [fallbackWord]),
  ]
}
