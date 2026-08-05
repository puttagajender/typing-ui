import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import HomeRowLesson from './HomeRowLesson'
import LearnHome from './LearnHome'
import { LEARNING_PROGRESS_KEY, loadLearningProgress } from '../services/learningProgressStorage'
import { GUIDED_EXERCISES, HOME_ROW_EXERCISES, WORD_EXERCISES } from '../utils/homeRowLesson'

const startPractice = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Finger Guide' }))
  fireEvent.click(screen.getByRole('button', { name: 'Start Practice' }))
}

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
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Finger Guide' }))
    expect(screen.getByText('Left pinky rests on A')).toBeVisible()
    expect(screen.getByText(/F and J usually have raised bumps/)).toBeVisible()
    expect(screen.getByLabelText('Home row keyboard layout')).toBeInTheDocument()
  })

  it('shows the lesson introduction before any typing exercise', () => {
    render(<HomeRowLesson />)
    expect(screen.getByText(/Every finger has a permanent home/)).toBeVisible()
    expect(screen.getByText(/This habit is called touch typing/)).toBeVisible()
    expect(screen.queryByLabelText('Type the exercise')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Home row keyboard layout')).not.toBeInTheDocument()
  })

  it('advances to the next guided exercise automatically', () => {
    render(<HomeRowLesson />)
    startPractice()
    const input = screen.getByLabelText('Type the exercise')
    expect(screen.getByText('f j f j')).toBeVisible()

    fireEvent.change(input, { target: { value: 'f j f j' } })
    expect(screen.getByText('d k d k')).toBeVisible()
    expect(screen.queryByText('s l s l')).not.toBeInTheDocument()
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })

  it('shows encouraging feedback after an exercise', () => {
    render(<HomeRowLesson />)
    startPractice()
    fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: 'f j f j' } })
    expect(screen.getByText('✓ Great!')).toBeVisible()
  })

  it('uses supportive feedback when a key needs improvement', () => {
    render(<HomeRowLesson />)
    startPractice()
    const input = screen.getByLabelText('Type the exercise')
    fireEvent.change(input, { target: { value: 'x' } })
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.change(input, { target: { value: 'f j f j' } })
    expect(screen.getByText('Let’s improve one key before continuing.')).toBeVisible()
  })

  it('shows live key, accuracy, and progress without WPM', () => {
    render(<HomeRowLesson />)
    startPractice()
    const feedback = screen.getByLabelText('Live exercise feedback')
    expect(feedback).toHaveTextContent('Current keyF')
    expect(feedback).toHaveTextContent('Current accuracy100.0%')
    expect(feedback).toHaveTextContent('Current progress0%')
    expect(screen.queryByText(/WPM/i)).not.toBeInTheDocument()
  })

  it('shows the lesson completion summary and next-lesson placeholder', () => {
    render(<HomeRowLesson />)
    startPractice()
    ;[...GUIDED_EXERCISES, ...HOME_ROW_EXERCISES, ...WORD_EXERCISES].forEach((target) => {
      fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: target } })
    })

    expect(screen.getByRole('heading', { name: 'Lesson Complete', level: 2 })).toBeVisible()
    expect(screen.getByText('Accuracy')).toBeVisible()
    expect(screen.getByText('Most improved key')).toBeVisible()
    expect(screen.getByText('Weakest key')).toBeVisible()
    expect(screen.getByText('Time spent')).toBeVisible()
    expect(screen.getByText('Next lesson').nextElementSibling).toHaveTextContent('Coming Soon')
  })

  it('blocks paste during guided practice', () => {
    render(<HomeRowLesson />)
    startPractice()
    const input = screen.getByLabelText('Type the exercise')
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true })
    input.dispatchEvent(pasteEvent)
    expect(pasteEvent.defaultPrevented).toBe(true)
    expect(input).toHaveValue('')
  })

  it('stores stage progress without typed lesson content', () => {
    render(<HomeRowLesson />)
    startPractice()
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
