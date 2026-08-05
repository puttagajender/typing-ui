import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import BottomRowLesson from './BottomRowLesson'
import LearnHome from './LearnHome'
import { LEARNING_PROGRESS_KEY, loadLearningProgress } from '../services/learningProgressStorage'
import { BOTTOM_ROW_EXERCISES } from '../utils/bottomRowLesson'

const earlierProgress = {
  currentLesson: 'home-row', completedLessonIds: ['home-row'], bestLessonAccuracy: 98, weakKeys: ['s'], lastAttemptedStage: 'result',
  lessons: { 'top-row-e-i': { completed: true, bestAccuracy: 97, weakKeys: ['e'], lastCompletedExercise: 12, masteryStatus: 'mastered' } },
}

const startPractice = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Finger Guide' }))
  fireEvent.click(screen.getByRole('button', { name: 'Start Practice' }))
}

describe('Bottom Row Introduction — C and N', () => {
  beforeEach(() => { window.localStorage.clear(); window.history.replaceState({}, '', '/') })

  it('appears after Lesson 2 on the learning home', () => {
    window.localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(earlierProgress))
    render(<LearnHome />)
    const lessonTwo = screen.getByRole('heading', { name: 'Top Row Introduction — E and I' }).closest('.lesson-card')
    const lessonThree = screen.getByRole('heading', { name: 'Bottom Row Introduction — C and N' }).closest('.lesson-card')
    expect(lessonTwo.compareDocumentPosition(lessonThree) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Start Lesson 3' })).toHaveAttribute('href', '/learn/bottom-row-c-n')
  })

  it('loads the Lesson 3 route', () => {
    window.history.replaceState({}, '', '/learn/bottom-row-c-n')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Bottom Row Introduction — C and N', level: 1 })).toBeVisible()
    expect(screen.getByText(/left middle finger moves down from D to C/i)).toBeVisible()
  })

  it('introduces only C and N as active new keys', () => {
    render(<BottomRowLesson />)
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Finger Guide' }))
    const guide = screen.getByLabelText('C and N keyboard finger movement')
    expect(Array.from(guide.querySelectorAll('.active-key strong'), (key) => key.textContent)).toEqual(['C', 'N'])
    expect(screen.getByText('C:', { selector: 'strong' }).parentElement).toHaveTextContent('left middle finger down from D')
    expect(screen.getByText('N:', { selector: 'strong' }).parentElement).toHaveTextContent('right index finger down from J')
  })

  it('shows correct C and N instructions while unlocking exercises sequentially', () => {
    render(<BottomRowLesson />)
    startPractice()
    expect(screen.getByText('c c c c')).toBeVisible()
    expect(screen.queryByText('n n n n')).not.toBeInTheDocument()
    expect(screen.getByText('Press C with your left middle finger.')).toBeVisible()
    fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: 'c c c c' } })
    expect(screen.getByText('n n n n')).toBeVisible()
    expect(screen.getByText('Press N with your right index finger.')).toBeVisible()
    expect(screen.getByLabelText('Type the exercise')).toHaveFocus()
  })

  it('stores Lesson 3 without changing earlier lesson progress', () => {
    window.localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(earlierProgress))
    render(<BottomRowLesson />)
    startPractice()
    BOTTOM_ROW_EXERCISES.forEach((target) => fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: target } }))
    const stored = loadLearningProgress()
    expect(stored.completedLessonIds).toEqual(earlierProgress.completedLessonIds)
    expect(stored.bestLessonAccuracy).toBe(earlierProgress.bestLessonAccuracy)
    expect(stored.weakKeys).toEqual(earlierProgress.weakKeys)
    expect(stored.lessons['top-row-e-i']).toEqual(earlierProgress.lessons['top-row-e-i'])
    expect(stored.lessons['bottom-row-c-n']).toMatchObject({ completed: true, bestAccuracy: 100, weakKeys: [], lastCompletedExercise: BOTTOM_ROW_EXERCISES.length, masteryStatus: 'mastered' })
    expect(screen.getByRole('heading', { name: 'Lesson 3 Complete' })).toBeVisible()
  })

  it('links Previous Lesson to Lesson 2', () => {
    render(<BottomRowLesson />)
    expect(screen.getByRole('link', { name: 'Previous Lesson' })).toHaveAttribute('href', '/learn/top-row-e-i')
  })

  it('uses responsive containers without fixed inline widths', () => {
    const { container } = render(<BottomRowLesson />)
    expect(container.querySelector('.lesson-stage-layout')).toBeInTheDocument()
    expect(container.querySelectorAll('[style*="width"], [style*="min-width"]')).toHaveLength(0)
  })
})
