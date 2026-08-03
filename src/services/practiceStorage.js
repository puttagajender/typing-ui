const SETTINGS_KEY = 'typing-coach:practice-settings'

export const DEFAULT_PRACTICE = {
  difficulty: 'BEGINNER',
  category: 'General English',
  testMode: '60',
  customDuration: 60,
  lastPassageId: null,
}

export function loadPracticeSettings(validDifficulties, validCategories) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SETTINGS_KEY))
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PRACTICE

    const difficulty = validDifficulties.includes(parsed.difficulty) ? parsed.difficulty : DEFAULT_PRACTICE.difficulty
    const category = validCategories.includes(parsed.category) ? parsed.category : DEFAULT_PRACTICE.category
    const validModes = ['30', '60', '120', 'complete', 'custom']
    const testMode = validModes.includes(parsed.testMode) ? parsed.testMode : DEFAULT_PRACTICE.testMode
    const customDuration = Number(parsed.customDuration)

    return {
      difficulty,
      category,
      testMode,
      customDuration: customDuration >= 15 && customDuration <= 300 ? customDuration : 60,
      lastPassageId: typeof parsed.lastPassageId === 'string' ? parsed.lastPassageId : null,
    }
  } catch {
    return DEFAULT_PRACTICE
  }
}

export function savePracticeSettings(settings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Continue without persistence when storage is unavailable.
  }
}
