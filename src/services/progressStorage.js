export const PROGRESS_STORAGE_KEY = 'typing-coach:progress'

export const EMPTY_PROGRESS = {
  totalTestsCompleted: 0,
  bestCorrectWpm: 0,
  bestGrossWpm: 0,
  averageCorrectWpm: 0,
  averageAccuracy: 0,
  totalTypingTime: 0,
  totalCharactersTyped: 0,
  currentStreak: 0,
  lastPracticeDate: null,
}

const finiteNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

const localDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const daysBetween = (first, second) => {
  const firstTime = Date.parse(`${first}T00:00:00Z`)
  const secondTime = Date.parse(`${second}T00:00:00Z`)
  return Math.round((secondTime - firstTime) / 86_400_000)
}

export function loadProgress() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY))
    if (!parsed || typeof parsed !== 'object') return EMPTY_PROGRESS

    return {
      totalTestsCompleted: Math.floor(finiteNumber(parsed.totalTestsCompleted)),
      bestCorrectWpm: finiteNumber(parsed.bestCorrectWpm),
      bestGrossWpm: finiteNumber(parsed.bestGrossWpm),
      averageCorrectWpm: finiteNumber(parsed.averageCorrectWpm),
      averageAccuracy: finiteNumber(parsed.averageAccuracy),
      totalTypingTime: finiteNumber(parsed.totalTypingTime),
      totalCharactersTyped: Math.floor(finiteNumber(parsed.totalCharactersTyped)),
      currentStreak: Math.floor(finiteNumber(parsed.currentStreak)),
      lastPracticeDate: /^\d{4}-\d{2}-\d{2}$/.test(parsed.lastPracticeDate) ? parsed.lastPracticeDate : null,
    }
  } catch {
    return EMPTY_PROGRESS
  }
}

export function saveProgress(progress) {
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // The dashboard remains usable when storage is restricted.
  }
}

export function updateProgress(currentProgress, result, charactersTyped, completedAt = new Date()) {
  const current = { ...EMPTY_PROGRESS, ...currentProgress }
  const correctWpm = finiteNumber(result.correctWpm ?? result.wpm)
  const grossWpm = finiteNumber(result.grossWpm, correctWpm)
  const accuracy = finiteNumber(result.accuracy)
  const duration = finiteNumber(result.durationInSeconds)
  const nextTestCount = current.totalTestsCompleted + 1
  const practiceDate = localDateKey(completedAt)

  let currentStreak = 1
  if (current.lastPracticeDate === practiceDate) {
    currentStreak = Math.max(1, current.currentStreak)
  } else if (current.lastPracticeDate && daysBetween(current.lastPracticeDate, practiceDate) === 1) {
    currentStreak = current.currentStreak + 1
  }

  return {
    totalTestsCompleted: nextTestCount,
    bestCorrectWpm: Math.max(current.bestCorrectWpm, correctWpm),
    bestGrossWpm: Math.max(current.bestGrossWpm, grossWpm),
    averageCorrectWpm: ((current.averageCorrectWpm * current.totalTestsCompleted) + correctWpm) / nextTestCount,
    averageAccuracy: ((current.averageAccuracy * current.totalTestsCompleted) + accuracy) / nextTestCount,
    totalTypingTime: current.totalTypingTime + duration,
    totalCharactersTyped: current.totalCharactersTyped + Math.max(0, Number(charactersTyped) || 0),
    currentStreak,
    lastPracticeDate: practiceDate,
  }
}
