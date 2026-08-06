import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HomeRowLesson from './HomeRowLesson'
import { generateLearningExercises } from '../services/learningApi'
import { LEARNING_PROGRESS_KEY } from '../services/learningProgressStorage'

vi.mock('../services/learningApi', () => ({
  LEARNING_API_ERROR: "We couldn't prepare a new practice set.",
  generateLearningExercises: vi.fn(),
}))

const batch = [
  { id: 'one', content: 'ffff', type: 'WARM_UP' }, { id: 'two', content: 'jjjj', type: 'WARM_UP' },
  { id: 'three', content: 'asdf', type: 'MOVEMENT_PRACTICE' }, { id: 'four', content: 'sad', type: 'WORD_PRACTICE' },
]

async function start() {
  fireEvent.click(screen.getByRole('button', { name: 'Begin Warm-up' }))
  return screen.findByLabelText('Type the exercise')
}

describe('dynamic guided lesson session', () => {
  beforeEach(() => { window.localStorage.clear(); generateLearningExercises.mockReset().mockResolvedValue(batch) })

  it('defaults to 15 minutes, offers each compact duration, and sends the correct payload once', async () => {
    render(<HomeRowLesson />)
    expect(screen.getByRole('radio', { name: /Standard Lesson/ })).toBeChecked()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.getByRole('radio', { name: /Quick Practice/ }).value).toBe('5')
    expect(screen.getByRole('radio', { name: /Deep Practice/ }).value).toBe('20')
    const startButton = screen.getByRole('button', { name: 'Begin Warm-up' })
    fireEvent.click(startButton); fireEvent.click(startButton)
    expect(await screen.findByText('ffff')).toBeVisible()
    expect(generateLearningExercises).toHaveBeenCalledTimes(1)
    expect(generateLearningExercises).toHaveBeenCalledWith({ lessonId: 'HOME_ROW_1', learnedKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'], weakKeys: [], exerciseType: 'MIXED', difficulty: 'BEGINNER', sessionDurationMinutes: 15, previousExerciseIds: [] }, expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })

  it('advances sequentially, refocuses, preserves accuracy, and prefetches with completed IDs', async () => {
    render(<HomeRowLesson />); const input = await start()
    fireEvent.change(input, { target: { value: 'ffff' } })
    expect(await screen.findByText('jjjj')).toBeVisible()
    expect(screen.getByLabelText('Type the exercise')).toHaveFocus()
    expect(screen.getByLabelText('Live exercise feedback')).toHaveTextContent('100.0%')
    fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: 'jjjj' } })
    await waitFor(() => expect(generateLearningExercises).toHaveBeenCalledTimes(2))
    expect(generateLearningExercises.mock.calls[1][0].previousExerciseIds).toEqual(['one', 'two'])
  })

  it('detects a weak key and requests recovery at the batch boundary', async () => {
    generateLearningExercises.mockResolvedValueOnce([{ id: 'weak', content: 'ffff', type: 'WARM_UP' }]).mockResolvedValueOnce([{ id: 'repair', content: 'fff', type: 'WEAK_KEY_RECOVERY' }])
    render(<HomeRowLesson />); await start()
    const input = screen.getByLabelText('Type the exercise')
    fireEvent.change(input, { target: { value: 'xxx' } }); fireEvent.change(input, { target: { value: '' } }); fireEvent.change(input, { target: { value: 'ffff' } })
    await waitFor(() => expect(generateLearningExercises).toHaveBeenCalledTimes(2))
    expect(generateLearningExercises.mock.calls[1][0]).toEqual(expect.objectContaining({ exerciseType: 'WEAK_KEY_RECOVERY', weakKeys: ['f'], previousExerciseIds: ['weak'] }))
  })

  it('offers retry and deterministic offline practice when generation fails', async () => {
    generateLearningExercises.mockRejectedValue(new Error('offline'))
    render(<HomeRowLesson />); fireEvent.click(screen.getByRole('button', { name: 'Begin Warm-up' }))
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't prepare a new practice set.")
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Use Offline Practice' }))
    expect(await screen.findByLabelText('Type the exercise')).toBeVisible()
  })

  it('aborts an obsolete request when leaving the lesson', async () => {
    let requestSignal
    generateLearningExercises.mockImplementation((_payload, options) => { requestSignal = options.signal; return new Promise(() => {}) })
    const { unmount } = render(<HomeRowLesson />)
    fireEvent.click(screen.getByRole('button', { name: 'Begin Warm-up' }))
    expect(await screen.findByText('Preparing your practice...')).toBeVisible()
    unmount(); expect(requestSignal.aborted).toBe(true)
  })

  it('shows completion metrics and persists only allowed lesson fields', async () => {
    render(<HomeRowLesson />); await start(); fireEvent.click(screen.getByRole('button', { name: 'End Session' }))
    expect(await screen.findByText('Mastery status')).toBeVisible()
    expect(screen.getByText('Weak-key improvements')).toBeVisible()
    const lesson = JSON.parse(window.localStorage.getItem(LEARNING_PROGRESS_KEY)).lessons['home-row']
    expect(Object.keys(lesson).sort()).toEqual(['bestAccuracy', 'completed', 'lastCompletedPhase', 'masteryStatus', 'selectedSessionDuration', 'weakKeys'].sort())
  })
})
