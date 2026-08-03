import { DIFFICULTY_PATH, RECOMMENDATION_RULES } from '../config/recommendationRules'
import { CATEGORIES } from '../data/passages'

const numericValue = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const thresholdChecks = {
  minCorrectWpm: (metrics, value) => metrics.correctWpm >= value,
  minAccuracy: (metrics, value) => metrics.accuracy >= value,
  maxAccuracy: (metrics, value) => metrics.accuracy <= value,
  maxMistakeCount: (metrics, value) => metrics.mistakeCount <= value,
  minMistakeCount: (metrics, value) => metrics.mistakeCount >= value,
  maxWpmGap: (metrics, value) => metrics.wpmGap <= value,
  minWpmGap: (metrics, value) => metrics.wpmGap >= value,
}

const matchesRule = (rule, metrics) => {
  const checks = Object.entries(rule.thresholds).map(([threshold, value]) =>
    thresholdChecks[threshold](metrics, value),
  )
  return rule.match === 'any' ? checks.some(Boolean) : checks.every(Boolean)
}

const resolveDifficulty = (currentDifficulty, action) => {
  const currentIndex = Math.max(0, DIFFICULTY_PATH.indexOf(currentDifficulty))
  if (action === 'next') return DIFFICULTY_PATH[Math.min(currentIndex + 1, DIFFICULTY_PATH.length - 1)]
  if (action === 'previous') return DIFFICULTY_PATH[Math.max(currentIndex - 1, 0)]
  return DIFFICULTY_PATH[currentIndex]
}

const resolveCategory = (currentCategory, action) => {
  const recommendationCategories = CATEGORIES.filter((category) => category !== 'Weak Keys')
  const currentIndex = Math.max(0, recommendationCategories.indexOf(currentCategory))
  if (action === 'next') return recommendationCategories[Math.min(currentIndex + 1, recommendationCategories.length - 1)]
  if (action === 'foundations') return 'General English'
  return recommendationCategories[currentIndex]
}

export function createCoachRecommendation(result, currentDifficulty, currentCategory = 'General English') {
  const correctWpm = numericValue(result.correctWpm ?? result.wpm)
  const grossWpm = numericValue(result.grossWpm, correctWpm)
  const metrics = {
    correctWpm,
    grossWpm,
    accuracy: numericValue(result.accuracy),
    mistakeCount: numericValue(result.mistakeCount),
    wpmGap: Math.max(0, grossWpm - correctWpm),
  }
  const rule = RECOMMENDATION_RULES.find((candidate) => matchesRule(candidate, metrics))

  return {
    ruleId: rule.id,
    nextDifficulty: resolveDifficulty(currentDifficulty, rule.difficultyAction),
    suggestedDuration: rule.suggestedDuration,
    suggestedCategory: resolveCategory(currentCategory, rule.categoryAction),
    explanation: rule.explanation,
    metrics,
  }
}
