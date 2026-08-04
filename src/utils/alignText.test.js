import { describe, expect, it } from 'vitest'
import { alignText, COMPARISON_TYPES } from './alignText'

const compact = (operations) => operations
  .filter((item) => item.type !== 'CURRENT' && item.type !== 'UNTYPED')
  .map((item) => [item.type, item.expectedCharacter, item.typedCharacter])

describe('typing text alignment', () => {
  it('keeps matching after an extra character in the middle', () => {
    const operations = compact(alignText('abcdef', 'abcXdef'))

    expect(operations).toContainEqual([COMPARISON_TYPES.EXTRA_CHARACTER, undefined, 'X'])
    expect(operations.slice(-3).map(([type]) => type)).toEqual([
      COMPARISON_TYPES.MATCH,
      COMPARISON_TYPES.MATCH,
      COMPARISON_TYPES.MATCH,
    ])
  })

  it('keeps matching after a missing character in the middle', () => {
    const operations = compact(alignText('abcdef', 'abdef'))

    expect(operations).toContainEqual([COMPARISON_TYPES.MISSING_CHARACTER, 'c', undefined])
    expect(operations.slice(-3).map(([type]) => type)).toEqual([
      COMPARISON_TYPES.MATCH,
      COMPARISON_TYPES.MATCH,
      COMPARISON_TYPES.MATCH,
    ])
  })

  it('classifies a substituted character as wrong', () => {
    expect(compact(alignText('abcdef', 'abcxef'))).toContainEqual([
      COMPARISON_TYPES.WRONG_CHARACTER,
      'd',
      'x',
    ])
  })

  it('aligns multiple independent mistakes without shifting later matches', () => {
    const operations = compact(alignText('abcdefghij', 'abXdefhij'))
    const types = operations.map(([type]) => type)

    expect(types).toContain(COMPARISON_TYPES.WRONG_CHARACTER)
    expect(types).toContain(COMPARISON_TYPES.MISSING_CHARACTER)
    expect(types.slice(-2)).toEqual([COMPARISON_TYPES.MATCH, COMPARISON_TYPES.MATCH])
  })

  it('marks every character in an exact match as correct', () => {
    const operations = compact(alignText('exact match', 'exact match'))

    expect(operations).toHaveLength('exact match'.length)
    expect(operations.every(([type]) => type === COMPARISON_TYPES.MATCH)).toBe(true)
  })

  it.each([
    ['  leading spaces', '  leading spaces'],
    ['trailing spaces  ', 'trailing spaces  '],
    ['Wait... what?', 'Wait... what?'],
    ['Version 2.0 uses 100%', 'Version 2.0 uses 100%'],
    ['BOOK keeper', 'BOOK keeper'],
  ])('preserves exact alignment for whitespace, punctuation, numbers, and case: %s', (original, typed) => {
    expect(compact(alignText(original, typed)).every(([type]) => type === COMPARISON_TYPES.MATCH)).toBe(true)
  })

  it('realigns after a repeated character', () => {
    const operations = compact(alignText('letter', 'lettter'))
    expect(operations).toContainEqual([COMPARISON_TYPES.EXTRA_CHARACTER, undefined, 't'])
    expect(operations.slice(-2).every(([type]) => type === COMPARISON_TYPES.MATCH)).toBe(true)
  })
})
