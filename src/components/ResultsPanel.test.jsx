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
  cpm: 228.4,
}

const metricValue = (label) => screen.getByText(label).closest('dt').nextElementSibling

describe('result screen', () => {
  it('makes Correct WPM and Accuracy the primary metrics', () => {
    render(<ResultsPanel result={result} />)
    const primaryMetrics = screen.getByLabelText('Primary typing statistics')

    expect(within(primaryMetrics).getByText('42.3')).toBeVisible()
    expect(within(primaryMetrics).getByText('96.5%')).toBeVisible()
    expect(primaryMetrics.querySelectorAll('.result-primary-metric')).toHaveLength(2)
  })

  it('formats valid zero counts as zero and optional values as Not available', () => {
    render(<ResultsPanel result={{ ...result, grossWpm: null, extraCharacterCount: undefined }} />)

    expect(metricValue('Mistakes')).toHaveTextContent('0')
    expect(metricValue('Wrong Characters')).toHaveTextContent('0')
    expect(metricValue('Missing Characters')).toHaveTextContent('0')
    expect(metricValue('Gross WPM')).toHaveTextContent('Not available')
    expect(metricValue('Extra Characters')).toHaveTextContent('Not available')
  })

  it('renders safely when optional result fields are omitted', () => {
    expect(() => render(<ResultsPanel result={{ correctWpm: 20, accuracy: 80 }} />)).not.toThrow()
    expect(screen.getAllByText('Not available').length).toBeGreaterThan(0)
  })

  it('displays CPM and accessible explanations for every statistic', () => {
    render(<ResultsPanel result={result} />)

    expect(metricValue('CPM')).toHaveTextContent('228.4')
    expect(screen.getByRole('button', { name: 'About Correct WPM' })).toHaveAccessibleDescription('The number of correctly typed words per minute.')
    expect(screen.getByRole('button', { name: 'About Gross WPM' })).toHaveAccessibleDescription('Your overall typing speed before deducting mistakes.')
    expect(screen.getByRole('button', { name: 'About Accuracy' })).toHaveAccessibleDescription('Percentage of correctly typed characters.')
    expect(screen.getAllByRole('tooltip')).toHaveLength(9)
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
    expect(container.querySelector('.result-primary-metrics')).toBeInTheDocument()
    expect(container.querySelectorAll('[style*="width"]')).toHaveLength(0)
  })
})
