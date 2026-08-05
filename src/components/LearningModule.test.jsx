import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import HomeRowLesson from './HomeRowLesson'
import LearnHome from './LearnHome'
import { LEARNING_PROGRESS_KEY, loadLearningProgress } from '../services/learningProgressStorage'

describe('Build Muscle Memory module', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('shows the entry point on Practice and routes to the learning home', () => {
    const { unmount } = render(<App />)
    expect(screen.getByRole('link', { name: 'New to touch typing? Build Muscle Memory →' })).toHaveAttribute('href', '/learn')
    unmount()

    window.history.replaceState({}, '', '/learn')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Build Muscle Memory', level: 1 })).toBeVisible()
  })

  it('shows Lesson 1 for a new learner and links to the lesson', () => {
    render(<LearnHome />)
    expect(screen.getByRole('heading', { name: 'Home Row Foundation' })).toBeVisible()
    expect(screen.getByText('Lessons completed').nextElementSibling).toHaveTextContent('0')
    expect(screen.getByRole('link', { name: 'Start Lesson' })).toHaveAttribute('href', '/learn/home-row')
  })

  it('routes to the home-row lesson and shows finger placement instructions', () => {
    window.history.replaceState({}, '', '/learn/home-row')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Home Row Foundation', level: 1 })).toBeVisible()
    expect(screen.getByText('Left pinky rests on A')).toBeVisible()
    expect(screen.getByText(/F and J usually have raised bumps/)).toBeVisible()
    expect(screen.getByLabelText('Home row keyboard layout')).toBeInTheDocument()
  })

  it('advances to the next guided exercise automatically', () => {
    render(<HomeRowLesson />)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const input = screen.getByLabelText('Type the exercise')
    expect(screen.getByText('f j f j')).toBeVisible()

    fireEvent.change(input, { target: { value: 'f j f j' } })
    expect(screen.getByText('d k d k')).toBeVisible()
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })

  it('blocks paste during guided practice', () => {
    render(<HomeRowLesson />)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const input = screen.getByLabelText('Type the exercise')
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true })
    input.dispatchEvent(pasteEvent)
    expect(pasteEvent.defaultPrevented).toBe(true)
    expect(input).toHaveValue('')
  })

  it('stores stage progress without typed lesson content', () => {
    render(<HomeRowLesson />)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const stored = JSON.parse(window.localStorage.getItem(LEARNING_PROGRESS_KEY))
    expect(stored).toMatchObject({ currentLesson: 'home-row', lastAttemptedStage: 'guided' })
    expect(stored).not.toHaveProperty('typedText')
    expect(loadLearningProgress().completedLessonIds).toEqual([])
  })

  it('handles corrupted learning progress safely', () => {
    window.localStorage.setItem(LEARNING_PROGRESS_KEY, '{invalid')
    expect(() => render(<LearnHome />)).not.toThrow()
    expect(screen.getByText('Lessons completed').nextElementSibling).toHaveTextContent('0')
  })

  it('provides navigation back to Practice without trapping the learner', () => {
    render(<HomeRowLesson />)
    expect(screen.getByRole('link', { name: 'Back to Practice' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Build Muscle Memory home' })).toHaveAttribute('href', '/learn')
  })

  it('uses a responsive lesson grid without fixed-width inline content', () => {
    const { container } = render(<HomeRowLesson />)
    expect(container.querySelector('.lesson-stage-layout')).toBeInTheDocument()
    expect(container.querySelectorAll('[style*="min-width"], [style*="width"]')).toHaveLength(0)
  })
})
