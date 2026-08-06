import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import TopRowLesson from './TopRowLesson'

vi.mock('../services/learningApi', () => ({ LEARNING_API_ERROR: "We couldn't prepare a new practice set.", generateLearningExercises: vi.fn().mockResolvedValue([{ id: 'e-1', content: 'eeeee', type: 'WARM_UP' }, { id: 'i-1', content: 'iiiii', type: 'WARM_UP' }]) }))

describe('Top Row Introduction — E and I', () => {
  beforeEach(() => { window.localStorage.clear(); window.history.replaceState({}, '', '/') })

  it('loads its existing route and instruction', () => {
    window.history.replaceState({}, '', '/learn/top-row-e-i'); render(<App />)
    expect(screen.getByRole('heading', { name: 'Top Row Introduction — E and I', level: 1 })).toBeVisible()
    expect(screen.getByText(/Move the left middle finger from D to E/)).toBeVisible()
  })

  it('uses E and I in rotating warm-ups with the existing finger guide', async () => {
    render(<TopRowLesson />); fireEvent.click(screen.getByRole('button', { name: 'Begin Warm-up' }))
    await screen.findByLabelText('Type the exercise')
    expect(screen.getByLabelText('E and I keyboard finger movement')).toBeInTheDocument()
    expect(screen.getByText('Press E with your left middle finger.')).toBeVisible()
    const first = screen.getByLabelText(/Type:/).textContent
    fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: first } })
    expect(screen.getByText('Press I with your right middle finger.')).toBeVisible()
  })

  it('retains Previous Lesson navigation', () => {
    render(<TopRowLesson />)
    expect(screen.getByRole('link', { name: 'Previous Lesson' })).toHaveAttribute('href', '/learn/home-row')
  })
})
