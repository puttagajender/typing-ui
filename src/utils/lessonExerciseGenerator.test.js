import { describe, expect, it } from 'vitest'
import { buildMiniChallenges, buildMovementExercises, buildWarmups, buildWordPractice, validateLearnedContent } from './lessonExerciseGenerator'

describe('deterministic lesson exercise generation', () => {
  it('creates rotating warm-ups without consecutive duplicate sequences', () => {
    const exercises = buildWarmups(['f', 'j', 'a', ';'])
    expect(exercises).toHaveLength(8)
    expect(exercises.every((exercise, index) => index === 0 || exercise !== exercises[index - 1])).toBe(true)
  })

  it('creates varied movement patterns with gradually increasing length', () => {
    const exercises = buildMovementExercises(['a', 's', 'd', 'f', 'j', 'k', 'l', ';'])
    expect(exercises.length).toBeGreaterThanOrEqual(12)
    expect(new Set(exercises).size).toBe(exercises.length)
    expect(exercises.at(-1).length).toBeGreaterThanOrEqual(exercises[0].length)
  })

  it('provides two hundred deterministic word placements with increasing vocabulary', () => {
    const words = ['sad', 'dad', 'ask', 'fall', 'flask', 'salad', 'salsa', 'falls']
    const exercises = buildWordPractice(words)
    expect(exercises).toHaveLength(40)
    expect(exercises.flatMap((exercise) => exercise.split(' '))).toHaveLength(200)
    expect(exercises.at(-1).split(' ').some((word) => word.length > 3)).toBe(true)
  })

  it('mixes words and movements while enforcing learned-letter boundaries', () => {
    const movements = buildMovementExercises(['a', 's', 'd', 'f'])
    const challenges = buildMiniChallenges(['sad', 'dad', 'ask'], movements)
    expect(challenges).toHaveLength(8)
    expect(validateLearnedContent(challenges, 'asdfk')).toBe(true)
    expect(validateLearnedContent(['safe'], 'asdf')).toBe(false)
  })
})
