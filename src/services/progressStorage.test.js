import { beforeEach, describe, expect, it } from 'vitest'
import { EMPTY_PROGRESS, loadProgress, PROGRESS_STORAGE_KEY, updateProgress } from './progressStorage'

describe('local progress storage and calculations', () => {
  beforeEach(() => window.localStorage.clear())

  it('records the first completed test', () => {
    const progress = updateProgress(EMPTY_PROGRESS, {
      correctWpm: 42.5,
      grossWpm: 46.2,
      accuracy: 96.4,
      durationInSeconds: 30,
    }, 120, new Date(2026, 7, 4))

    expect(progress).toMatchObject({
      totalTestsCompleted: 1,
      bestCorrectWpm: 42.5,
      bestGrossWpm: 46.2,
      averageCorrectWpm: 42.5,
      averageAccuracy: 96.4,
      totalTypingTime: 30,
      totalCharactersTyped: 120,
      currentStreak: 1,
      lastPracticeDate: '2026-08-04',
    })
  })

  it('updates best values and weighted averages across tests', () => {
    const first = updateProgress(EMPTY_PROGRESS, {
      correctWpm: 30,
      grossWpm: 35,
      accuracy: 90,
      durationInSeconds: 30,
    }, 80, new Date(2026, 7, 4))
    const second = updateProgress(first, {
      correctWpm: 50,
      grossWpm: 55,
      accuracy: 98,
      durationInSeconds: 60,
    }, 160, new Date(2026, 7, 4))

    expect(second).toMatchObject({
      totalTestsCompleted: 2,
      bestCorrectWpm: 50,
      bestGrossWpm: 55,
      averageCorrectWpm: 40,
      averageAccuracy: 94,
      totalTypingTime: 90,
      totalCharactersTyped: 240,
      currentStreak: 1,
    })
  })

  it('maintains the streak on the same day and increments it on the next day', () => {
    const dayOne = updateProgress(EMPTY_PROGRESS, { wpm: 20 }, 10, new Date(2026, 7, 4))
    const sameDay = updateProgress(dayOne, { wpm: 21 }, 10, new Date(2026, 7, 4, 20))
    const nextDay = updateProgress(sameDay, { wpm: 22 }, 10, new Date(2026, 7, 5))

    expect(sameDay.currentStreak).toBe(1)
    expect(nextDay.currentStreak).toBe(2)
  })

  it('resets the streak after a missed day', () => {
    const first = updateProgress(EMPTY_PROGRESS, { wpm: 20 }, 10, new Date(2026, 7, 1))
    const afterGap = updateProgress(first, { wpm: 22 }, 10, new Date(2026, 7, 4))

    expect(afterGap.currentStreak).toBe(1)
  })

  it('returns safe defaults for corrupted localStorage', () => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, '{broken')

    expect(loadProgress()).toEqual(EMPTY_PROGRESS)
  })
})
