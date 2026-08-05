import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import LearnHome from './LearnHome'
import TopRowLesson from './TopRowLesson'
import { LEARNING_PROGRESS_KEY, loadLearningProgress } from '../services/learningProgressStorage'
import { TOP_ROW_EXERCISES } from '../utils/topRowLesson'

const lessonOneProgress = {
  currentLesson: 'home-row', completedLessonIds: ['home-row'], bestLessonAccuracy: 98, weakKeys: ['s'], lastAttemptedStage: 'result', lessons: {},
}

const startPractice = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Finger Guide' }))
  fireEvent.click(screen.getByRole('button', { name: 'Start Practice' }))
}

describe('Top Row Introduction — E and I', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('appears after Lesson 1 on the learning home', () => {
    window.localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(lessonOneProgress))
    render(<LearnHome />)
    const lessonOne = screen.getByRole('heading', { name: 'Home Row Foundation' }).closest('.lesson-card')
    const lessonTwo = screen.getByRole('heading', { name: 'Top Row Introduction — E and I' }).closest('.lesson-card')
    expect(lessonOne.compareDocumentPosition(lessonTwo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Start Lesson 2' })).toHaveAttribute('href', '/learn/top-row-e-i')
  })

  it('loads the Lesson 2 route correctly', () => {
    window.history.replaceState({}, '', '/learn/top-row-e-i')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Top Row Introduction — E and I', level: 1 })).toBeVisible()
    expect(screen.getByText(/left middle finger moves from D to E/i)).toBeVisible()
  })

  it('introduces only E and I as active new keys with correct finger instructions', () => {
    render(<TopRowLesson />)
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Finger Guide' }))
    const guide = screen.getByLabelText('E and I keyboard finger movement')
    expect(guide.querySelectorAll('.active-key')).toHaveLength(2)
    expect(Array.from(guide.querySelectorAll('.active-key strong'), (key) => key.textContent)).toEqual(['E', 'I'])
    expect(screen.getByText('E:', { selector: 'strong' }).parentElement).toHaveTextContent('move your left middle finger up from D')
    expect(screen.getByText('I:', { selector: 'strong' }).parentElement).toHaveTextContent('move your right middle finger up from K')
  })

  it('unlocks exercises sequentially and announces the active finger', () => {
    render(<TopRowLesson />)
    startPractice()
    expect(screen.getByText('e e e e')).toBeVisible()
    expect(screen.queryByText('i i i i')).not.toBeInTheDocument()
    expect(screen.getByText('Press E with your left middle finger.')).toBeVisible()

    fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: 'e e e e' } })
    expect(screen.getByText('i i i i')).toBeVisible()
    expect(screen.getByText('Press I with your right middle finger.')).toBeVisible()
    expect(screen.getByLabelText('Type the exercise')).toHaveFocus()
  })

  it('stores Lesson 2 completion without changing Lesson 1 progress', () => {
    window.localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(lessonOneProgress))
    render(<TopRowLesson />)
    startPractice()
    TOP_ROW_EXERCISES.forEach((target) => fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: target } }))

    const stored = loadLearningProgress()
    expect(stored.completedLessonIds).toEqual(['home-row'])
    expect(stored.bestLessonAccuracy).toBe(98)
    expect(stored.weakKeys).toEqual(['s'])
    expect(stored.lessons['top-row-e-i']).toMatchObject({ completed: true, bestAccuracy: 100, weakKeys: [], lastCompletedExercise: TOP_ROW_EXERCISES.length, masteryStatus: 'mastered' })
    expect(screen.getByRole('heading', { name: 'Lesson 2 Complete' })).toBeVisible()
  })

  it('links Previous Lesson to Lesson 1', () => {
    render(<TopRowLesson />)
    expect(screen.getByRole('link', { name: 'Previous Lesson' })).toHaveAttribute('href', '/learn/home-row')
  })

  it('uses responsive containers without fixed inline widths', () => {
    const { container } = render(<TopRowLesson />)
    expect(container.querySelector('.lesson-stage-layout')).toBeInTheDocument()
    expect(container.querySelectorAll('[style*="width"], [style*="min-width"]')).toHaveLength(0)
  })
})
