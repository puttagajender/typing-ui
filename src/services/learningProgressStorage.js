export const LEARNING_PROGRESS_KEY = 'typing-coach:learning-progress'

export const EMPTY_LEARNING_PROGRESS = {
  currentLesson: 'home-row',
  completedLessonIds: [],
  bestLessonAccuracy: 0,
  weakKeys: [],
  lastAttemptedStage: 'understand',
  lessons: {},
}

function sanitizeLessons(lessons) {
  if (!lessons || typeof lessons !== 'object' || Array.isArray(lessons)) return {}
  return Object.fromEntries(Object.entries(lessons).filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value)).map(([id, value]) => [id, {
    completed: Boolean(value.completed),
    bestAccuracy: Number.isFinite(Number(value.bestAccuracy)) ? Math.max(0, Math.min(100, Number(value.bestAccuracy))) : 0,
    weakKeys: Array.isArray(value.weakKeys) ? value.weakKeys.filter((key) => typeof key === 'string') : [],
    lastCompletedPhase: typeof value.lastCompletedPhase === 'string' ? value.lastCompletedPhase : 'learn',
    selectedSessionDuration: [5, 15, 20].includes(Number(value.selectedSessionDuration)) ? Number(value.selectedSessionDuration) : 15,
    masteryStatus: value.masteryStatus === 'mastered' ? 'mastered' : 'needs-practice',
  }]))
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
      lessons: sanitizeLessons(progress.lessons),
    }
  } catch {
    return EMPTY_LEARNING_PROGRESS
  }
}

export function saveLessonProgress(lessonId, lessonProgress) {
  const current = loadLearningProgress()
  const allowed = {
    completed: Boolean(lessonProgress.completed),
    bestAccuracy: Number.isFinite(Number(lessonProgress.bestAccuracy)) ? Number(lessonProgress.bestAccuracy) : 0,
    weakKeys: Array.isArray(lessonProgress.weakKeys) ? lessonProgress.weakKeys.filter((key) => typeof key === 'string') : [],
    lastCompletedPhase: typeof lessonProgress.lastCompletedPhase === 'string' ? lessonProgress.lastCompletedPhase : 'learn',
    selectedSessionDuration: [5, 15, 20].includes(Number(lessonProgress.selectedSessionDuration)) ? Number(lessonProgress.selectedSessionDuration) : 15,
    masteryStatus: lessonProgress.masteryStatus === 'mastered' ? 'mastered' : 'needs-practice',
  }
  saveLearningProgress({
    ...current,
    lessons: { ...current.lessons, [lessonId]: allowed },
  })
}

export function saveLearningProgress(progress) {
  try {
    window.localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    // The lesson remains usable when local storage is restricted.
  }
}
