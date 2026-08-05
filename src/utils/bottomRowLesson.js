export const BOTTOM_ROW_EXERCISE_GROUPS = [
  { id: 'single', label: 'Single keys', exercises: ['c c c c', 'n n n n'] },
  { id: 'movement', label: 'Home-row movement', exercises: ['d c d c', 'j n j n'] },
  { id: 'alternating', label: 'Alternating movement', exercises: ['c n c n', 'dc jn dc jn'] },
  { id: 'words', label: 'Short combinations', exercises: ['can', 'nice', 'dance', 'scan', 'sand', 'desk', 'find', 'line'] },
]

export const BOTTOM_ROW_EXERCISES = BOTTOM_ROW_EXERCISE_GROUPS.flatMap(({ exercises }) => exercises)
export const REQUIRED_BOTTOM_ROW_GUIDED_EXERCISES = 6
export const LESSON_THREE_ALLOWED_KEYS = new Set('asdfjkl;eicn ')

export function exercisesUseOnlyTaughtKeys(exercises = BOTTOM_ROW_EXERCISES) {
  return exercises.every((exercise) => Array.from(exercise).every((key) => LESSON_THREE_ALLOWED_KEYS.has(key)))
}

export function evaluateBottomRowMastery({ accuracy, guidedExercisesCompleted, wordExercisesCompleted, mistakesByKey }) {
  const weakKeys = ['c', 'n'].filter((key) => (mistakesByKey[key] ?? 0) >= 3)
  return {
    passed: accuracy >= 95
      && guidedExercisesCompleted >= REQUIRED_BOTTOM_ROW_GUIDED_EXERCISES
      && wordExercisesCompleted >= 1
      && weakKeys.length === 0,
    weakKeys,
  }
}
