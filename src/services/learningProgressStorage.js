export const LEARNING_PROGRESS_KEY = 'typing-coach:learning-progress'

export const EMPTY_LEARNING_PROGRESS = {
  currentLesson: 'home-row',
  completedLessonIds: [],
  bestLessonAccuracy: 0,
  weakKeys: [],
  lastAttemptedStage: 'understand',
  lessons: {},
}

export function loadLearningProgress() {
  try {
    const progress = JSON.parse(window.localStorage.getItem(LEARNING_PROGRESS_KEY))
    if (!progress || typeof progress !== 'object') return EMPTY_LEARNING_PROGRESS

    return {
      currentLesson: typeof progress.currentLesson === 'string' ? progress.currentLesson : 'home-row',
      completedLessonIds: Array.isArray(progress.completedLessonIds) ? progress.completedLessonIds.filter((id) => typeof id === 'string') : [],
      bestLessonAccuracy: Number.isFinite(Number(progress.bestLessonAccuracy)) ? Math.max(0, Math.min(100, Number(progress.bestLessonAccuracy))) : 0,
      weakKeys: Array.isArray(progress.weakKeys) ? progress.weakKeys.filter((key) => typeof key === 'string') : [],
      lastAttemptedStage: typeof progress.lastAttemptedStage === 'string' ? progress.lastAttemptedStage : 'understand',
      lessons: progress.lessons && typeof progress.lessons === 'object' && !Array.isArray(progress.lessons) ? progress.lessons : {},
    }
  } catch {
    return EMPTY_LEARNING_PROGRESS
  }
}

export function saveLessonProgress(lessonId, lessonProgress) {
  const current = loadLearningProgress()
  saveLearningProgress({
    ...current,
    lessons: { ...current.lessons, [lessonId]: lessonProgress },
  })
}

export function saveLearningProgress(progress) {
  try {
    window.localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    // The lesson remains usable when local storage is restricted.
  }
}
