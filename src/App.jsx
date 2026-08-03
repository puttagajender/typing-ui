import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import ErrorMessage from './components/ErrorMessage'
import ResultsPanel from './components/ResultsPanel'
import TestControls from './components/TestControls'
import TypingInput from './components/TypingInput'
import TypingPassage from './components/TypingPassage'
import { PASSAGE } from './data/passages'
import { analyzeTyping } from './services/typingApi'

function App() {
  const [typedText, setTypedText] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const startPerformanceRef = useRef(null)
  const submissionStartedRef = useRef(false)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  useEffect(() => {
    console.log('Application loaded')
  }, [])

  useEffect(() => {
    if (result) {
      console.log('Result displayed')
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [result])

  useEffect(() => {
    if (!startedAt || result || isSubmitting) return undefined

    const updateElapsed = () => {
      setElapsedSeconds((performance.now() - startPerformanceRef.current) / 1000)
    }
    const intervalId = window.setInterval(updateElapsed, 100)
    return () => window.clearInterval(intervalId)
  }, [startedAt, result, isSubmitting])

  const submitAttempt = useCallback(async (textToSubmit) => {
    if (!startedAt || submissionStartedRef.current) return

    console.log('Test completed')
    submissionStartedRef.current = true
    setIsSubmitting(true)
    setError('')
    setElapsedSeconds((performance.now() - startPerformanceRef.current) / 1000)

    try {
      const analysis = await analyzeTyping({
        originalText: PASSAGE,
        typedText: textToSubmit,
        startedAt,
        completedAt: new Date().toISOString(),
      })
      setResult(analysis)
    } catch (requestError) {
      setError(requestError.message)
      submissionStartedRef.current = false
    } finally {
      setIsSubmitting(false)
    }
  }, [startedAt])

  const handleTyping = (event) => {
    if (isSubmitting || result) return

    const nextText = event.target.value.slice(0, PASSAGE.length)
    let attemptStartedAt = startedAt

    if (!startedAt && nextText.length > 0) {
      console.log('Test started')
      console.log('Timer started')
      console.log('User started typing')
      attemptStartedAt = new Date().toISOString()
      startPerformanceRef.current = performance.now()
      setStartedAt(attemptStartedAt)
    }

    setTypedText(nextText)

    if (nextText.length === PASSAGE.length && attemptStartedAt) {
      console.log('Test completed')
      // State updates are asynchronous, so submit with the timestamps from this event.
      submissionStartedRef.current = true
      setIsSubmitting(true)
      setError('')
      setElapsedSeconds((performance.now() - startPerformanceRef.current) / 1000)
      analyzeTyping({
        originalText: PASSAGE,
        typedText: nextText,
        startedAt: attemptStartedAt,
        completedAt: new Date().toISOString(),
      })
        .then(setResult)
        .catch((requestError) => {
          setError(requestError.message)
          submissionStartedRef.current = false
        })
        .finally(() => setIsSubmitting(false))
    }
  }

  const restartTest = () => {
    console.log('Restart clicked')
    setTypedText('')
    setStartedAt(null)
    setElapsedSeconds(0)
    setIsSubmitting(false)
    setResult(null)
    setError('')
    startPerformanceRef.current = null
    submissionStartedRef.current = false
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  const testEnded = isSubmitting || Boolean(result)

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Accuracy first. Speed follows.</p>
        <h1>Typing Coach</h1>
        <p className="intro">Type the passage below exactly as shown. Your result is analysed when you finish.</p>
      </header>

      <section className="practice-card" aria-labelledby="practice-heading" aria-busy={isSubmitting}>
        <div className="practice-heading-row">
          <h2 id="practice-heading">Practice passage</h2>
          <div className="live-stats">
            <span><strong>{elapsedSeconds.toFixed(1)}</strong><small>seconds</small></span>
            <span><strong>{typedText.length} / {PASSAGE.length}</strong><small>characters</small></span>
          </div>
        </div>

        <TypingPassage
          originalText={PASSAGE}
          typedText={typedText}
          comparisonItems={result?.comparisonItems ?? result?.comparisonDetails ?? result?.mistakeDetails}
        />
        <div
          className="typing-progress"
          role="progressbar"
          aria-label="Typing progress"
          aria-valuemin="0"
          aria-valuemax={PASSAGE.length}
          aria-valuenow={typedText.length}
        >
          <span style={{ width: `${(typedText.length / PASSAGE.length) * 100}%` }} />
        </div>
        <TypingInput
          ref={inputRef}
          value={typedText}
          onChange={handleTyping}
          disabled={testEnded}
          maxLength={PASSAGE.length}
        />
        <TestControls
          hasStarted={Boolean(startedAt)}
          isSubmitting={isSubmitting}
          hasResult={Boolean(result)}
          onFinish={() => submitAttempt(typedText)}
          onRestart={restartTest}
        />
      </section>

      {isSubmitting && (
        <div className="notification notification-loading" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <div>
            <strong>Analysing your typing...</strong>
            <span>Your results will be ready in a moment.</span>
          </div>
        </div>
      )}
      <ErrorMessage message={error} />
      {result && (
        <>
          <div className="notification notification-success" role="status">
            <span className="notification-icon" aria-hidden="true">✓</span>
            <div>
              <strong>Analysis complete</strong>
              <span>Your typing results are ready.</span>
            </div>
          </div>
          <ResultsPanel ref={resultsRef} result={result} onTryAgain={restartTest} />
        </>
      )}
    </main>
  )
}

export default App
