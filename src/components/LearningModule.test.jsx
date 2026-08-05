import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import HomeRowLesson from './HomeRowLesson'
import LearnHome from './LearnHome'

const beginLesson = () => fireEvent.click(screen.getByRole('button', { name: 'Begin Warm-up' }))

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

  it('unlocks varied warm-ups sequentially with encouraging feedback', () => {
    render(<HomeRowLesson />); beginLesson()
    const first = screen.getByLabelText(/Type:/).textContent
    fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: first } })
    const second = screen.getByLabelText(/Type:/).textContent
    expect(second).not.toBe(first)
    expect(screen.getByText('✓ Great!')).toBeVisible()
    expect(screen.getByLabelText('Type the exercise')).toHaveFocus()
  })

  it('shows accuracy and progress without WPM or a timer', () => {
    render(<HomeRowLesson />); beginLesson()
    expect(screen.getByLabelText('Live exercise feedback')).toHaveTextContent('Accuracy100.0%')
    expect(screen.getByLabelText('Live exercise feedback')).toHaveTextContent('Progress0%')
    expect(screen.queryByText(/WPM/i)).not.toBeInTheDocument()
    expect(screen.getByText(/There is no timer/)).toBeVisible()
  })

  it('blocks paste and provides escape navigation', () => {
    render(<HomeRowLesson />); beginLesson()
    const input = screen.getByLabelText('Type the exercise')
    const event = new Event('paste', { bubbles: true, cancelable: true }); input.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(screen.getByRole('link', { name: 'Back to Practice' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Back to Build Muscle Memory' })).toHaveAttribute('href', '/learn')
  })

  it('progresses through recovery into a complete lesson review', () => {
    render(<HomeRowLesson />); beginLesson()
    let guard = 0
    while (!screen.queryByRole('heading', { name: 'Lesson Review' }) && guard < 100) {
      const target = screen.getByLabelText(/Type:/).textContent
      fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: target } })
      guard += 1
    }
    expect(guard).toBeLessThan(100)
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
