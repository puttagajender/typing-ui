import { describe, expect, it } from 'vitest'
import { generateRepairDrill } from './homeRowLesson'
import { evaluateBottomRowMastery, exercisesUseOnlyTaughtKeys, REQUIRED_BOTTOM_ROW_GUIDED_EXERCISES } from './bottomRowLesson'

describe('Lesson 3 mastery and repair rules', () => {
  it('verifies every exercise uses only taught keys', () => {
    expect(exercisesUseOnlyTaughtKeys()).toBe(true)
  })

  it('generates the C repair drill in the required progression', () => {
    expect(generateRepairDrill('c')).toEqual(['c c c c c', 'dc cd', 'cn nc', 'can can', 'scan scan', 'dance dance'])
  })

  it('generates the N repair drill in the required progression', () => {
    expect(generateRepairDrill('n')).toEqual(['n n n n n', 'jn nj', 'cn nc', 'can can', 'nice nice', 'sand sand'])
  })

  it('passes at 95% with all guided exercises and a completed word', () => {
    expect(evaluateBottomRowMastery({ accuracy: 95, guidedExercisesCompleted: REQUIRED_BOTTOM_ROW_GUIDED_EXERCISES, wordExercisesCompleted: 1, mistakesByKey: { c: 2, n: 2 } }).passed).toBe(true)
  })

  it('does not pass when C or N has three final-attempt mistakes', () => {
    expect(evaluateBottomRowMastery({ accuracy: 98, guidedExercisesCompleted: 6, wordExercisesCompleted: 2, mistakesByKey: { c: 3 } })).toMatchObject({ passed: false, weakKeys: ['c'] })
    expect(evaluateBottomRowMastery({ accuracy: 98, guidedExercisesCompleted: 6, wordExercisesCompleted: 2, mistakesByKey: { n: 3 } })).toMatchObject({ passed: false, weakKeys: ['n'] })
  })
})
