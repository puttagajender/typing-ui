import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { COMPARISON_TYPES } from '../utils/alignText'
import TypingPassage from './TypingPassage'

const passage = () => screen.getByLabelText('Text to type')
const referenceCharacters = () => passage().querySelectorAll('.passage-character')

describe('TypingPassage', () => {
  it('keeps the original passage immutable throughout typing', () => {
    const originalText = 'Keep this text.'
    const { rerender } = render(<TypingPassage originalText={originalText} typedText="" />)

    for (const typedText of ['Keep', 'KeepX this', 'Keep this txt.']) {
      rerender(<TypingPassage originalText={originalText} typedText={typedText} />)
      expect(passage()).toHaveTextContent(originalText)
      expect(Array.from(referenceCharacters(), (node) => node.textContent).join('')).toBe(originalText)
    }
  })

  it('renders extra characters as markers without inserting them into the reference text', () => {
    render(<TypingPassage originalText="abcdef" typedText="abcXdef" />)

    expect(passage()).toHaveTextContent('abcdef')
    expect(passage()).not.toHaveTextContent('abcXdef')
    const marker = screen.getByRole('img', { name: 'Extra character X' })
    expect(marker).toHaveAttribute('data-extra-character', 'X')
    expect(marker).toHaveAttribute('data-comparison-type', COMPARISON_TYPES.EXTRA_CHARACTER)
  })

  it('preserves reference highlighting for mixed mistakes while showing extras separately', () => {
    const comparisonItems = [
      { type: COMPARISON_TYPES.MATCH, expectedCharacter: 'a', typedCharacter: 'a', originalIndex: 0 },
      { type: COMPARISON_TYPES.EXTRA_CHARACTER, typedCharacter: 'X', originalIndex: 1 },
      { type: COMPARISON_TYPES.WRONG_CHARACTER, expectedCharacter: 'b', typedCharacter: 'z', originalIndex: 1 },
      { type: COMPARISON_TYPES.MISSING_CHARACTER, expectedCharacter: 'c', originalIndex: 2 },
      { type: 'CURRENT', expectedCharacter: 'd', originalIndex: 3 },
      { type: 'UNTYPED', expectedCharacter: 'e', originalIndex: 4 },
      { type: 'UNTYPED', expectedCharacter: 'f', originalIndex: 5 },
    ]
    render(<TypingPassage originalText="abcdef" typedText="aXz" comparisonItems={comparisonItems} />)

    expect(passage()).toHaveTextContent('abcdef')
    expect(passage().querySelector('[data-extra-character="X"]')).toBeInTheDocument()
    expect(passage().querySelectorAll(`[data-comparison-type="${COMPARISON_TYPES.MATCH}"]`).length).toBeGreaterThan(0)
    expect(passage().querySelectorAll(`[data-comparison-type="${COMPARISON_TYPES.WRONG_CHARACTER}"]`)).toHaveLength(1)
    expect(passage().querySelectorAll(`[data-comparison-type="${COMPARISON_TYPES.MISSING_CHARACTER}"]`).length).toBeGreaterThan(0)
    expect(passage().querySelectorAll(`[data-comparison-type="${COMPARISON_TYPES.EXTRA_CHARACTER}"]`)).toHaveLength(1)
    expect(passage().querySelectorAll('[data-comparison-type="CURRENT"]')).toHaveLength(1)
    expect(passage().querySelectorAll('[data-comparison-type="UNTYPED"]')).toHaveLength(2)
  })
})
