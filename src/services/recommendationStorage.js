import { CATEGORIES, DIFFICULTIES } from '../data/passages'

export const RECOMMENDATION_STORAGE_KEY = 'typing-coach:last-recommendation'

export function loadRecommendation() {
  try {
    const stored = window.localStorage.getItem(RECOMMENDATION_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    const validDifficulty = DIFFICULTIES.some((item) => item.value === parsed?.nextDifficulty)
    const validCategory = CATEGORIES.includes(parsed?.suggestedCategory)
    const validDuration = [30, 60, 120].includes(Number(parsed?.suggestedDuration))
    return validDifficulty && validCategory && validDuration && typeof parsed.explanation === 'string'
      ? parsed
      : null
  } catch {
    return null
  }
}

export function saveRecommendation(recommendation) {
  try {
    window.localStorage.setItem(RECOMMENDATION_STORAGE_KEY, JSON.stringify(recommendation))
  } catch {
    // Storage may be unavailable in private browsing or restricted environments.
  }
}
