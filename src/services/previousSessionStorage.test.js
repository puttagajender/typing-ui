import { beforeEach, describe, expect, it } from 'vitest'
import {
  PREVIOUS_SESSION_STORAGE_KEY,
  compareSessions,
  createSessionSnapshot,
  loadPreviousSession,
  savePreviousSession,
} from './previousSessionStorage'

const previous = {
  correctWpm: 40,
  grossWpm: 44,
  accuracy: 94,
  mistakeCount: 5,
  duration: 60,
  difficulty: 'BEGINNER',
  category: 'General English',
  timestamp: '2026-08-04T10:00:00.000Z',
}

describe('previous session comparison storage', () => {
  beforeEach(() => window.localStorage.clear())

  it('returns no previous session when localStorage is missing', () => {
    expect(loadPreviousSession()).toBeNull()
  })

  it('ignores corrupted localStorage', () => {
    window.localStorage.setItem(PREVIOUS_SESSION_STORAGE_KEY, '{broken')
    expect(loadPreviousSession()).toBeNull()
  })

  it('stores and loads only the latest completed session snapshot', () => {
    savePreviousSession(previous)
    const latest = { ...previous, correctWpm: 42, timestamp: '2026-08-05T10:00:00.000Z' }
    savePreviousSession(latest)

    expect(loadPreviousSession()).toEqual(latest)
    expect(JSON.parse(window.localStorage.getItem(PREVIOUS_SESSION_STORAGE_KEY))).toEqual(latest)
  })

  it('creates the required snapshot from an analysis and configuration', () => {
    const snapshot = createSessionSnapshot(
      { correctWpm: 42.3, grossWpm: 46.2, accuracy: 96.4, mistakeCount: 3, durationInSeconds: 31 },
      { difficulty: 'INTERMEDIATE', category: 'Java', duration: 60 },
      new Date('2026-08-05T12:00:00.000Z'),
    )

    expect(snapshot).toEqual({ correctWpm: 42.3, grossWpm: 46.2, accuracy: 96.4, mistakeCount: 3, duration: 60, difficulty: 'INTERMEDIATE', category: 'Java', timestamp: '2026-08-05T12:00:00.000Z' })
  })

  it('reports improved WPM', () => {
    expect(compareSessions({ ...previous, correctWpm: 42.3 }, previous).correctWpm).toBeCloseTo(2.3)
  })

  it('reports reduced WPM', () => {
    expect(compareSessions({ ...previous, correctWpm: 37.5 }, previous).correctWpm).toBe(-2.5)
  })

  it('reports improved accuracy', () => {
    expect(compareSessions({ ...previous, accuracy: 95.4 }, previous).accuracy).toBeCloseTo(1.4)
  })

  it('reports increased mistakes', () => {
    expect(compareSessions({ ...previous, mistakeCount: 8 }, previous).mistakeCount).toBe(3)
  })

  it('detects a different practice configuration', () => {
    expect(compareSessions({ ...previous, category: 'Java' }, previous).hasDifferentConfiguration).toBe(true)
  })
})
