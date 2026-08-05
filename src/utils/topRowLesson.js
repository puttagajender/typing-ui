export const TOP_ROW_EXERCISE_GROUPS = [
  { id: 'single', label: 'Single keys', exercises: ['e e e e', 'i i i i'] },
  { id: 'movement', label: 'Home-row movement', exercises: ['d e d e', 'k i k i'] },
  { id: 'alternating', label: 'Alternating movement', exercises: ['e i e i', 'de ki de ki'] },
  { id: 'words', label: 'Short combinations', exercises: ['see', 'idea', 'side', 'like', 'file', 'desk'] },
]

export const TOP_ROW_EXERCISES = TOP_ROW_EXERCISE_GROUPS.flatMap(({ exercises }) => exercises)
export const REQUIRED_GUIDED_EXERCISES = 6

export function evaluateTopRowMastery({ accuracy, guidedExercisesCompleted, wordExercisesCompleted, mistakesByKey }) {
  const weakKeys = ['e', 'i'].filter((key) => (mistakesByKey[key] ?? 0) >= 3)
  return {
    passed: accuracy >= 95
      && guidedExercisesCompleted >= REQUIRED_GUIDED_EXERCISES
      && wordExercisesCompleted >= 1
      && weakKeys.length === 0,
    weakKeys,
  }
}
