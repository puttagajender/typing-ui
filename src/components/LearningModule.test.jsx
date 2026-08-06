import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import HomeRowLesson from './HomeRowLesson'
import LearnHome from './LearnHome'

vi.mock('../services/learningApi', () => ({
  LEARNING_API_ERROR: "We couldn't prepare a new practice set.",
  generateLearningExercises: vi.fn().mockResolvedValue([
    { id: 'warm-1', content: 'fffff', type: 'WARM_UP' }, { id: 'warm-2', content: 'jjjjj', type: 'WARM_UP' },
    { id: 'move-1', content: 'asdf', type: 'MOVEMENT_PRACTICE' }, { id: 'word-1', content: 'sad', type: 'WORD_PRACTICE' },
  ]),
}))

const beginLesson = async () => { fireEvent.click(screen.getByRole('button', { name: 'Begin Warm-up' })); await screen.findByLabelText('Type the exercise') }

describe('Build Muscle Memory module', () => {
  beforeEach(() => { window.localStorage.clear(); window.history.replaceState({}, '', '/') })

  it('keeps Practice as home and links to the learning module', () => {
    const { unmount } = render(<App />)
    expect(screen.getByRole('link', { name: 'New to touch typing? Build Muscle Memory →' })).toHaveAttribute('href', '/learn')
    unmount(); window.history.replaceState({}, '', '/learn'); render(<App />)
    expect(screen.getByRole('heading', { name: 'Build Muscle Memory', level: 1 })).toBeVisible()
  })

  it('shows the existing lessons without adding keyboard content', () => {
    render(<LearnHome />)
    expect(screen.getByRole('heading', { name: 'Home Row Foundation' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Top Row Introduction — E and I' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Bottom Row Introduction — C and N' })).toBeVisible()
  })

  it('starts with a complete Learn phase and no typing input', () => {
    render(<HomeRowLesson />)
    expect(screen.getByRole('heading', { name: 'Learn' })).toBeVisible()
    expect(screen.getByText('Finger placement')).toBeVisible()
    expect(screen.getByText('Finger movement')).toBeVisible()
    expect(screen.getByText('Home position')).toBeVisible()
    expect(screen.getByText('Common mistakes')).toBeVisible()
    expect(screen.queryByLabelText('Type the exercise')).not.toBeInTheDocument()
  })

  it('shows all seven phases in order', () => {
    render(<HomeRowLesson />)
    expect(Array.from(screen.getByLabelText('Lesson phases').children, (item) => item.textContent)).toEqual(['Learn', 'Warm-up', 'Movement Practice', 'Word Practice', 'Mini Challenge', 'Weak Key Recovery', 'Lesson Review'])
  })

  it('unlocks varied warm-ups sequentially with encouraging feedback', async () => {
    render(<HomeRowLesson />); await beginLesson()
    const first = screen.getByLabelText(/Type:/).textContent
    fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: first } })
    const second = screen.getByLabelText(/Type:/).textContent
    expect(second).not.toBe(first)
    expect(screen.getByText('✓ Great!')).toBeVisible()
    expect(screen.getByLabelText('Type the exercise')).toHaveFocus()
  })

  it('shows accuracy and progress without WPM or a timer', async () => {
    render(<HomeRowLesson />); await beginLesson()
    expect(screen.getByLabelText('Live exercise feedback')).toHaveTextContent('Accuracy100.0%')
    expect(screen.getByLabelText('Live exercise feedback')).toHaveTextContent('Progress0%')
    expect(screen.queryByText(/WPM/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Focus on relaxed accuracy/)).toBeVisible()
  })

  it('blocks paste and provides escape navigation', async () => {
    render(<HomeRowLesson />); await beginLesson()
    const input = screen.getByLabelText('Type the exercise')
    const event = new Event('paste', { bubbles: true, cancelable: true }); input.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(screen.getByRole('link', { name: 'Back to Practice' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Back to Build Muscle Memory' })).toHaveAttribute('href', '/learn')
  })

  it('shows a complete lesson review after the learner ends the session', async () => {
    render(<HomeRowLesson />); await beginLesson()
    fireEvent.click(screen.getByRole('button', { name: 'End Session' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Lesson Review' })).toBeVisible())
    expect(screen.getByText('Time spent')).toBeVisible()
    expect(screen.getByText('Strongest key')).toBeVisible()
    expect(screen.getByText('Weakest key')).toBeVisible()
    expect(screen.getByText('Exercises completed')).toBeVisible()
    expect(screen.getByText('Words completed')).toBeVisible()
    expect(screen.getByText('Recommendation')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute('href', '/learn')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  it('uses responsive containers without fixed inline width', () => {
    const { container } = render(<HomeRowLesson />)
    expect(container.querySelector('.lesson-stage-layout')).toBeInTheDocument()
    expect(container.querySelectorAll('[style*="width"], [style*="min-width"]')).toHaveLength(0)
  })
})
