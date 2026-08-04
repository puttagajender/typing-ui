import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import SeoContent from './SeoContent'

describe('SeoContent', () => {
  it('renders the five educational sections with a logical heading hierarchy', () => {
    render(<SeoContent />)

    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'About Typing Coach',
      'Why Accuracy Matters',
      'What is WPM?',
      'How to Improve Your Typing Speed',
      'Frequently Asked Questions',
    ])
    expect(screen.getByRole('heading', { level: 3, name: 'Correct WPM' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: 'Gross WPM' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: 'CPM' })).toBeVisible()
  })

  it('uses focusable native disclosures for every FAQ', async () => {
    const user = userEvent.setup()
    render(<SeoContent />)

    const question = screen.getByText('What is a good typing speed?').closest('summary')
    const disclosure = question.closest('details')
    expect(document.querySelectorAll('.seo-faq-list details')).toHaveLength(5)
    expect(disclosure).not.toHaveAttribute('open')

    expect(question.tabIndex).toBe(0)
    await user.click(question)

    expect(disclosure).toHaveAttribute('open')
    expect(disclosure).toHaveTextContent('Around 40 WPM')
  })
})
