import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import BottomRowLesson from './BottomRowLesson'

vi.mock('../services/learningApi', () => ({ LEARNING_API_ERROR: "We couldn't prepare a new practice set.", generateLearningExercises: vi.fn().mockResolvedValue([{ id: 'c-1', content: 'ccccc', type: 'WARM_UP' }, { id: 'n-1', content: 'nnnnn', type: 'WARM_UP' }]) }))

describe('Bottom Row Introduction — C and N', () => {
  beforeEach(() => { window.localStorage.clear(); window.history.replaceState({}, '', '/') })

  it('loads its existing route and instruction', () => {
    window.history.replaceState({}, '', '/learn/bottom-row-c-n'); render(<App />)
    expect(screen.getByRole('heading', { name: 'Bottom Row Introduction — C and N', level: 1 })).toBeVisible()
    expect(screen.getByText(/left middle finger down from D to C/i)).toBeVisible()
  })

  it('uses C and N in rotating warm-ups with the existing finger guide', async () => {
    render(<BottomRowLesson />); fireEvent.click(screen.getByRole('button', { name: 'Begin Warm-up' }))
    await screen.findByLabelText('Type the exercise')
    expect(screen.getByLabelText('C and N keyboard finger movement')).toBeInTheDocument()
    expect(screen.getByText('Press C with your left middle finger.')).toBeVisible()
    const first = screen.getByLabelText(/Type:/).textContent
    fireEvent.change(screen.getByLabelText('Type the exercise'), { target: { value: first } })
    expect(screen.getByText('Press N with your right index finger.')).toBeVisible()
  })

  it('retains Previous Lesson navigation and responsive structure', () => {
    const { container } = render(<BottomRowLesson />)
    expect(screen.getByRole('link', { name: 'Previous Lesson' })).toHaveAttribute('href', '/learn/top-row-e-i')
    expect(container.querySelectorAll('[style*="width"], [style*="min-width"]')).toHaveLength(0)
  })
})
