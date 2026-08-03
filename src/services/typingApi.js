const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const requestBaseUrl = import.meta.env.DEV ? '' : API_BASE_URL

export async function analyzeTyping(attempt) {
  if (!API_BASE_URL) {
    throw new Error('The API address is not configured. Add VITE_API_BASE_URL to the .env file.')
  }

  try {
    console.log('Calling backend API')
    const response = await fetch(`${requestBaseUrl}/api/v1/typing/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt),
    })

    if (!response.ok) {
      let detail = ''
      try {
        const body = await response.json()
        detail = body.message || body.error || ''
      } catch {
        // Some server errors do not include a JSON response body.
      }

      if (response.status >= 400 && response.status < 500) {
        throw new Error(detail || 'Please check the attempt and try again.')
      }
      throw new Error(detail || 'The typing service is unavailable. Please try again shortly.')
    }

    const result = await response.json()
    console.log('Backend response received', result)
    return result
  } catch (error) {
    console.error('Backend request failed')
    if (error instanceof TypeError) {
      throw new Error(
        'Could not connect to the typing service. Make sure the backend is running.',
        { cause: error },
      )
    }
    throw error
  }
}
