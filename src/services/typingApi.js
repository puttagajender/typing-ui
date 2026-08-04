const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const requestBaseUrl = import.meta.env.DEV ? '' : API_BASE_URL
const ANALYSIS_TIMEOUT_MS = 45000

export async function analyzeTyping(attempt) {
  if (!API_BASE_URL) {
    throw new Error('The analysis service is not configured. Please contact support.')
  }

  try {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS)
    let response
    try {
      response = await fetch(`${requestBaseUrl}/api/v1/typing/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
        signal: controller.signal,
      })
    } finally {
      window.clearTimeout(timeoutId)
    }

    if (!response.ok) {
      let detail = ''
      try {
        const body = await response.json()
        detail = body.message || body.error || ''
      } catch {
        // Some server errors do not include a JSON response body.
      }

      if (response.status >= 400 && response.status < 500) {
        if (response.status === 400 && detail) throw new Error(detail)
        throw new Error('The analysis service could not process this request. Please try again.')
      }
      throw new Error('The analysis service is unavailable right now. Please try again.')
    }

    const result = await response.json()
    return result
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('The analysis took too long. Please retry.', { cause: error })
    }
    if (error instanceof TypeError) {
      throw new Error(
        'We could not reach the analysis service. Please try again.',
        { cause: error },
      )
    }
    if (error instanceof SyntaxError) {
      throw new Error('The analysis service returned an unexpected response. Please try again.', { cause: error })
    }
    throw error
  }
}
