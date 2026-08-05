export const PREVIOUS_SESSION_STORAGE_KEY = 'typing-coach:latest-session'

const finiteNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export function createSessionSnapshot(result, configuration, completedAt = new Date()) {
  const correctWpm = finiteNumber(result.correctWpm ?? result.wpm) ?? 0
  const grossWpm = finiteNumber(result.grossWpm) ?? correctWpm
  const mistakeCount = finiteNumber(result.mistakeCount)
    ?? ((finiteNumber(result.wrongCharacterCount) ?? 0) + (finiteNumber(result.missingCharacterCount) ?? 0) + (finiteNumber(result.extraCharacterCount) ?? 0))

  return {
    correctWpm,
    grossWpm,
    accuracy: finiteNumber(result.accuracy) ?? 0,
    mistakeCount,
    duration: finiteNumber(configuration.duration ?? result.durationInSeconds) ?? 0,
    difficulty: configuration.difficulty,
    category: configuration.category,
    timestamp: completedAt.toISOString(),
  }
}

export function loadPreviousSession() {
  try {
    const session = JSON.parse(window.localStorage.getItem(PREVIOUS_SESSION_STORAGE_KEY))
    if (!session || typeof session !== 'object') return null

    const numericFields = ['correctWpm', 'grossWpm', 'accuracy', 'mistakeCount', 'duration']
    if (numericFields.some((field) => finiteNumber(session[field]) === null)) return null
    if (typeof session.difficulty !== 'string' || typeof session.category !== 'string') return null
    if (typeof session.timestamp !== 'string' || Number.isNaN(Date.parse(session.timestamp))) return null

    return {
      correctWpm: Number(session.correctWpm),
      grossWpm: Number(session.grossWpm),
      accuracy: Number(session.accuracy),
      mistakeCount: Number(session.mistakeCount),
      duration: Number(session.duration),
      difficulty: session.difficulty,
      category: session.category,
      timestamp: session.timestamp,
    }
  } catch {
    return null
  }
}

export function savePreviousSession(session) {
  try {
    window.localStorage.setItem(PREVIOUS_SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Results remain available when local storage is restricted.
  }
}

export function compareSessions(current, previous) {
  if (!previous) return null

  const delta = (field) => current[field] - previous[field]
  return {
    correctWpm: delta('correctWpm'),
    accuracy: delta('accuracy'),
    mistakeCount: delta('mistakeCount'),
    grossWpm: delta('grossWpm'),
    hasDifferentConfiguration: current.difficulty !== previous.difficulty
      || current.category !== previous.category
      || current.duration !== previous.duration,
  }
}
