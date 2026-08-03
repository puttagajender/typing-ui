import { afterEach, describe, expect, it, vi } from 'vitest'
import { analyzeTyping } from './typingApi'

const attempt = {
  originalText: 'Original passage',
  typedText: 'Typed passage',
  startedAt: '2026-08-03T07:00:00.000Z',
  completedAt: '2026-08-03T07:00:30.000Z',
}

describe('typing API service', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('posts the attempt as JSON and returns the backend response', async () => {
    const responseBody = { wpm: 25.5, accuracy: 94.5 }
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(responseBody) })
    vi.stubGlobal('fetch', fetchMock)

    await expect(analyzeTyping(attempt)).resolves.toEqual(responseBody)
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/typing/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt),
    })
  })

  it('returns a friendly validation message from a failed request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ message: 'Typed text is required.' }),
    }))

    await expect(analyzeTyping(attempt)).rejects.toThrow('Typed text is required.')
  })

  it('returns a friendly message for a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(analyzeTyping(attempt)).rejects.toThrow('Could not connect to the typing service')
  })

  it('rejects an invalid JSON response without hiding the failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
    }))

    await expect(analyzeTyping(attempt)).rejects.toThrow('Unexpected token')
  })
})
