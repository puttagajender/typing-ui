const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const requestBaseUrl = import.meta.env.DEV ? '' : API_BASE_URL.replace(/\/$/, '')

export const LEARNING_EXERCISES_ENDPOINT = '/api/v1/learning/exercises/generate'
export const LEARNING_API_ERROR = "We couldn't prepare a new practice set."

function normalizeExercise(raw, index) {
  const content = raw?.content ?? raw?.targetContent ?? raw?.target ?? raw?.text
  if (typeof content !== 'string' || !content.length) return null
  return {
    id: String(raw.id ?? raw.exerciseId ?? `generated-${index}`),
    content,
    type: String(raw.exerciseType ?? raw.type ?? raw.phase ?? 'MIXED').toUpperCase(),
  }
}

export async function generateLearningExercises(payload, { signal } = {}) {
  let response
  try {
    response = await fetch(`${requestBaseUrl}${LEARNING_EXERCISES_ENDPOINT}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error(LEARNING_API_ERROR, { cause: error })
  }
  if (!response.ok) throw new Error(LEARNING_API_ERROR)
  const body = await response.json()
  const source = Array.isArray(body) ? body : body.exercises ?? body.items ?? body.data?.exercises
  const exercises = Array.isArray(source) ? source.map(normalizeExercise).filter(Boolean) : []
  if (!exercises.length) throw new Error(LEARNING_API_ERROR)
  return exercises
}
