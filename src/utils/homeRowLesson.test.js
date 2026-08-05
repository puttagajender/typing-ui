import { describe, expect, it } from 'vitest'
import { calculateAccuracy, evaluateHomeRowMastery, generateRepairDrill } from './homeRowLesson'

describe('home-row lesson rules', () => {
  it('calculates accuracy correctly', () => {
    expect(calculateAccuracy(19, 20)).toBe(95)
    expect(calculateAccuracy(0, 0)).toBe(100)
  })

  it('passes mastery at 95% with enough guided work and no repeated weak key', () => {
    expect(evaluateHomeRowMastery({ accuracy: 95, guidedExercisesCompleted: 2, mistakesByKey: { s: 2 } }).passed).toBe(true)
  })

  it('does not pass mastery below 95%', () => {
    expect(evaluateHomeRowMastery({ accuracy: 94.9, guidedExercisesCompleted: 4, mistakesByKey: {} }).passed).toBe(false)
  })

  it('does not pass when one key has three mistakes', () => {
    const result = evaluateHomeRowMastery({ accuracy: 98, guidedExercisesCompleted: 4, mistakesByKey: { s: 3 } })
    expect(result.passed).toBe(false)
    expect(result.weakKeys).toEqual(['s'])
  })

  it('generates a local repair drill in single-key, pairs, then words order', () => {
    const drill = generateRepairDrill('s')
    expect(drill[0]).toBe('s s s s s')
    expect(drill[1]).toMatch(/^[as]{2} [as]{2}$/)
    expect(drill.slice(2).every((exercise) => exercise.split(' ').every((word) => word.includes('s')))).toBe(true)
  })
})
