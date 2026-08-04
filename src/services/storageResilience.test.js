import { afterEach, describe, expect, it, vi } from 'vitest'
import { CATEGORIES, DIFFICULTIES } from '../data/passages'
import { DEFAULT_PRACTICE, loadPracticeSettings, savePracticeSettings } from './practiceStorage'
import { EMPTY_PROGRESS, loadProgress, saveProgress } from './progressStorage'
import { loadRecommendation, saveRecommendation } from './recommendationStorage'

describe('storage resilience', () => {
  afterEach(() => vi.restoreAllMocks())

  it('falls back safely when localStorage reads are unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })

    expect(loadPracticeSettings(DIFFICULTIES.map(({ value }) => value), CATEGORIES)).toEqual(DEFAULT_PRACTICE)
    expect(loadProgress()).toEqual(EMPTY_PROGRESS)
    expect(loadRecommendation()).toBeNull()
  })

  it('continues safely when localStorage writes are unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked') })

    expect(() => savePracticeSettings(DEFAULT_PRACTICE)).not.toThrow()
    expect(() => saveProgress(EMPTY_PROGRESS)).not.toThrow()
    expect(() => saveRecommendation({ nextDifficulty: 'BEGINNER' })).not.toThrow()
  })
})
