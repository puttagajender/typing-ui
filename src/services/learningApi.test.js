import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateLearningExercises, LEARNING_EXERCISES_ENDPOINT } from './learningApi'

describe('learning exercise API', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('posts the generation payload and normalizes exercises', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ exercises: [{ exerciseId: 7, targetContent: 'asdf', exerciseType: 'movement_practice' }] }) })
    vi.stubGlobal('fetch', fetchMock)
    const payload = { lessonId: 'HOME_ROW_1', learnedKeys: ['a'], previousExerciseIds: [] }
    await expect(generateLearningExercises(payload)).resolves.toEqual([{ id: '7', content: 'asdf', type: 'MOVEMENT_PRACTICE' }])
    expect(fetchMock).toHaveBeenCalledWith(LEARNING_EXERCISES_ENDPOINT, expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }))
  })

  it('uses the learner-friendly error for failed and empty responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(generateLearningExercises({})).rejects.toThrow("We couldn't prepare a new practice set.")
  })
})
