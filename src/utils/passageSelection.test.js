import { describe, expect, it } from 'vitest'
import { selectPassage } from './passageSelection'

const fixtures = [
  { id: 'exact-1', category: 'SQL', difficulty: 'ADVANCED', text: 'Exact one' },
  { id: 'exact-2', category: 'SQL', difficulty: 'ADVANCED', text: 'Exact two' },
  { id: 'near', category: 'SQL', difficulty: 'INTERMEDIATE', text: 'Nearest level' },
  { id: 'general', category: 'General English', difficulty: 'EXPERT', text: 'General fallback' },
  { id: 'any', category: 'Git', difficulty: 'BEGINNER', text: 'Any fallback' },
]

describe('passage selection', () => {
  it('selects an exact category and difficulty match', () => {
    expect(selectPassage({ category: 'SQL', difficulty: 'ADVANCED', passages: fixtures, random: () => 0 }).id).toBe('exact-1')
  })

  it('avoids immediately repeating a passage when an alternative exists', () => {
    expect(selectPassage({ category: 'SQL', difficulty: 'ADVANCED', lastPassageId: 'exact-1', passages: fixtures, random: () => 0 }).id).toBe('exact-2')
  })

  it('falls back to the nearest difficulty in the same category', () => {
    expect(selectPassage({ category: 'SQL', difficulty: 'BEGINNER', passages: fixtures, random: () => 0 }).id).toBe('near')
  })

  it('falls back to General English at the selected difficulty', () => {
    expect(selectPassage({ category: 'Java', difficulty: 'EXPERT', passages: fixtures, random: () => 0 }).id).toBe('general')
  })

  it('falls back to any available passage as a final safeguard', () => {
    const onlyPassage = [fixtures[4]]
    expect(selectPassage({ category: 'Java', difficulty: 'EXPERT', passages: onlyPassage, random: () => 0 })).toEqual(fixtures[4])
  })
})
