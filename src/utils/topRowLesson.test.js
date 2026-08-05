import { describe, expect, it } from 'vitest'
import { generateRepairDrill } from './homeRowLesson'
import { evaluateTopRowMastery, REQUIRED_GUIDED_EXERCISES } from './topRowLesson'

describe('Lesson 2 mastery and repair rules', () => {
  it('generates the E repair drill as single key, movement pair, then words', () => {
    expect(generateRepairDrill('e')).toEqual(['e e e e e', 'de ed', 'see see', 'side side'])
  })

  it('generates the I repair drill as single key, movement pair, then words', () => {
    expect(generateRepairDrill('i')).toEqual(['i i i i i', 'ki ik', 'like like', 'idea idea'])
  })

  it('passes at 95% when all guided work and a word are complete', () => {
    expect(evaluateTopRowMastery({ accuracy: 95, guidedExercisesCompleted: REQUIRED_GUIDED_EXERCISES, wordExercisesCompleted: 1, mistakesByKey: { e: 2, i: 2 } }).passed).toBe(true)
  })

  it('does not pass when E or I has three final-attempt mistakes', () => {
    expect(evaluateTopRowMastery({ accuracy: 98, guidedExercisesCompleted: REQUIRED_GUIDED_EXERCISES, wordExercisesCompleted: 2, mistakesByKey: { e: 3 } })).toMatchObject({ passed: false, weakKeys: ['e'] })
    expect(evaluateTopRowMastery({ accuracy: 98, guidedExercisesCompleted: REQUIRED_GUIDED_EXERCISES, wordExercisesCompleted: 2, mistakesByKey: { i: 3 } })).toMatchObject({ passed: false, weakKeys: ['i'] })
  })
})
