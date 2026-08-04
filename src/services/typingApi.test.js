import { afterEach, describe, expect, it, vi } from 'vitest'
import { analyzeTyping } from './typingApi'

const attempt = {
  originalText: 'Original passage',
  typedText: 'Typed passage',
  startedAt: '2026-08-03T07:00:00.000Z',
  completedAt: '2026-08-03T07:00:30.000Z',
}

describe('typing API service', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('posts the attempt as JSON and returns the backend response', async () => {
    const responseBody = { wpm: 25.5, accuracy: 94.5 }
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(responseBody) })
    vi.stubGlobal('fetch', fetchMock)

    await expect(analyzeTyping(attempt)).resolves.toEqual(responseBody)
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/typing/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt),
      signal: expect.any(AbortSignal),
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

    await expect(analyzeTyping(attempt)).rejects.toThrow('Your practice is safe. Check your connection, then retry analysis.')
  })

  it('hides raw server error details behind a friendly message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ message: 'Internal Server Error: stack trace' }),
    }))

    await expect(analyzeTyping(attempt)).rejects.toThrow('Your practice is safe. The analysis service is unavailable, so please try again shortly.')
  })

  it('returns a friendly message for an invalid JSON response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
    }))

    await expect(analyzeTyping(attempt)).rejects.toThrow('Your practice is safe. We received an unexpected response, so please retry analysis.')
  })

  it('returns a friendly message for a missing analysis endpoint', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({ message: 'Not Found' }),
    }))

    await expect(analyzeTyping(attempt)).rejects.toThrow('Your practice is safe. Review your input, then retry analysis.')
  })

  it('times out a request that takes too long', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_, options) => new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })))

    const request = analyzeTyping(attempt)
    const rejection = expect(request).rejects.toThrow('Your practice is safe. The analysis took too long, so please retry.')
    await vi.advanceTimersByTimeAsync(45000)
    await rejection
  })
})
