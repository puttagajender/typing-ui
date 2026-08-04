import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CoachRecommendation from './CoachRecommendation'
import ResultsPanel from './ResultsPanel'

const result = {
  correctWpm: 42.34,
  grossWpm: 45.67,
  accuracy: 96.45,
  durationInSeconds: 31.24,
  mistakeCount: 0,
  wrongCharacterCount: 0,
  missingCharacterCount: 0,
  extraCharacterCount: 0,
}

describe('result screen', () => {
  it('makes Correct WPM the single visually primary metric', () => {
    render(<ResultsPanel result={result} />)
    const primaryMetric = screen.getByText('Correct WPM').closest('[data-primary-metric="true"]')

    expect(primaryMetric).toBeInTheDocument()
    expect(within(primaryMetric).getByText('42.3')).toBeVisible()
    expect(document.querySelectorAll('[data-primary-metric="true"]')).toHaveLength(1)
  })

  it('formats valid zero counts as zero and optional values as Not available', () => {
    render(<ResultsPanel result={{ ...result, grossWpm: null, extraCharacterCount: undefined }} />)

    expect(screen.getByText('Total Mistakes').nextElementSibling).toHaveTextContent('0')
    expect(screen.getByText('Wrong Characters').nextElementSibling).toHaveTextContent('0')
    expect(screen.getByText('Missing Characters').nextElementSibling).toHaveTextContent('0')
    expect(screen.getByText('Gross WPM').nextElementSibling).toHaveTextContent('Not available')
    expect(screen.getByText('Extra Characters').nextElementSibling).toHaveTextContent('Not available')
  })

  it('renders safely when optional result fields are omitted', () => {
    expect(() => render(<ResultsPanel result={{ correctWpm: 20, accuracy: 80 }} />)).not.toThrow()
    expect(screen.getAllByText('Not available').length).toBeGreaterThan(0)
  })

  it('shows recommendation details and wires all actions', () => {
    const onContinue = vi.fn()
    const onPracticeAgain = vi.fn()
    const onChooseAnother = vi.fn()
    render(<CoachRecommendation recommendation={{ nextDifficulty: 'INTERMEDIATE', suggestedCategory: 'Java', suggestedDuration: 60, explanation: 'Keep a steady rhythm.', metrics: { accuracy: 99, wpmGap: 2 } }} onContinue={onContinue} onPracticeAgain={onPracticeAgain} onChooseAnother={onChooseAnother} />)

    expect(screen.getByText('Excellent accuracy. You are ready for a harder passage.')).toBeVisible()
    expect(screen.getByText('Recommended difficulty')).toBeVisible()
    expect(screen.getByText('Friendly level name')).toBeVisible()
    expect(screen.getByText('Reason')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Continue Recommended Practice' }))
    fireEvent.click(screen.getByRole('button', { name: 'Practice Again' }))
    fireEvent.click(screen.getByRole('button', { name: 'Choose Another Practice' }))
    expect(onContinue).toHaveBeenCalledOnce()
    expect(onPracticeAgain).toHaveBeenCalledOnce()
    expect(onChooseAnother).toHaveBeenCalledOnce()
  })

  it('shows a useful state when a recommendation is unavailable', () => {
    render(<CoachRecommendation recommendation={null} />)
    expect(screen.getByText('Complete another session to receive personalised recommendations.')).toBeVisible()
  })

  it('hides missing recommendation values cleanly', () => {
    render(<CoachRecommendation recommendation={{ suggestedCategory: 'Java' }} onPracticeAgain={() => {}} onChooseAnother={() => {}} />)
    expect(screen.getByText('Java')).toBeVisible()
    expect(screen.queryByText('Recommended difficulty')).not.toBeInTheDocument()
    expect(screen.queryByText('Recommended duration')).not.toBeInTheDocument()
    expect(screen.queryByText(/null|undefined|Not available/i)).not.toBeInTheDocument()
  })

  it('uses responsive containers that do not force a fixed viewport width', () => {
    const { container } = render(<ResultsPanel result={result} />)
    expect(container.querySelector('.result-overview')).toBeInTheDocument()
    expect(container.querySelectorAll('[style*="width"]')).toHaveLength(0)
  })
})
