import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PreviousTestComparison from './PreviousTestComparison'

const session = {
  correctWpm: 42.3,
  grossWpm: 45.8,
  accuracy: 95.4,
  mistakeCount: 2,
  duration: 60,
  difficulty: 'BEGINNER',
  category: 'General English',
  timestamp: '2026-08-05T10:00:00.000Z',
}

describe('PreviousTestComparison', () => {
  it('shows a first-session message without a previous session', () => {
    render(<PreviousTestComparison currentSession={session} previousSession={null} />)
    expect(screen.getByText('This is your first completed session.')).toBeVisible()
  })

  it('shows compact directional comparisons', () => {
    render(<PreviousTestComparison currentSession={session} previousSession={{ ...session, correctWpm: 40, grossWpm: 44, accuracy: 94, mistakeCount: 5 }} />)

    expect(screen.getByLabelText('Correct WPM: Increased by 2.3')).toHaveTextContent('▲ +2.3')
    expect(screen.getByLabelText('Accuracy: Increased by 1.4%')).toHaveTextContent('▲ +1.4%')
    expect(screen.getByLabelText('Mistakes: Decreased by 3')).toHaveTextContent('▼ -3')
    expect(screen.getByLabelText('Gross WPM: Increased by 1.8')).toHaveTextContent('▲ +1.8')
  })

  it('shows a note for a different practice configuration', () => {
    render(<PreviousTestComparison currentSession={session} previousSession={{ ...session, difficulty: 'INTERMEDIATE' }} />)
    expect(screen.getByText('Comparison is based on a different practice configuration.')).toBeVisible()
  })

  it('uses a responsive grid without fixed inline sizing', () => {
    const { container } = render(<PreviousTestComparison currentSession={session} previousSession={session} />)
    expect(container.querySelector('.comparison-metrics')).toBeInTheDocument()
    expect(container.querySelectorAll('[style*="width"]')).toHaveLength(0)
  })
})
