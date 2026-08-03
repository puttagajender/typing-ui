import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import BenefitsSection from './components/BenefitsSection'
import ErrorMessage from './components/ErrorMessage'
import FaqSection from './components/FaqSection'
import FeaturesSection from './components/FeaturesSection'
import LandingHero from './components/LandingHero'
import ResultsPanel from './components/ResultsPanel'
import SiteFooter from './components/SiteFooter'
import TestControls from './components/TestControls'
import TestSettings from './components/TestSettings'
import TypingInput from './components/TypingInput'
import TypingPassage from './components/TypingPassage'
import WhyChooseSection from './components/WhyChooseSection'
import { PASSAGES, TEST_MODES } from './data/passages'
import { analyzeTyping } from './services/typingApi'
import { getAttemptedOriginalText } from './utils/alignText'

function App() {
  const [difficulty, setDifficulty] = useState('beginner')
  const [passageIndex, setPassageIndex] = useState(0)
  const [testMode, setTestMode] = useState('complete')
  const [typedText, setTypedText] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [completionAnnouncement, setCompletionAnnouncement] = useState('')
  const startPerformanceRef = useRef(null)
  const submissionStartedRef = useRef(false)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  const originalText = PASSAGES[difficulty][passageIndex]
  const selectedMode = TEST_MODES.find((mode) => mode.value === testMode)
  const timedDuration = selectedMode?.duration ?? null

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

  const submitAttempt = useCallback(async (textToSubmit, automatic = false) => {
    if (!startedAt || submissionStartedRef.current || textToSubmit.length === 0) return

    console.log('Test completed')
    submissionStartedRef.current = true
    setIsSubmitting(true)
    setError('')
    const finalElapsed = (performance.now() - startPerformanceRef.current) / 1000
    setElapsedSeconds(finalElapsed)

    if (automatic && timedDuration) {
      setCompletionAnnouncement('Time is up. Your test was submitted automatically.')
    }

    const requestOriginalText = timedDuration
      ? getAttemptedOriginalText(originalText, textToSubmit)
      : originalText

    try {
      const analysis = await analyzeTyping({
        originalText: requestOriginalText,
        typedText: textToSubmit,
        startedAt,
        completedAt: new Date().toISOString(),
      })
      setResult(analysis)
    } catch (requestError) {
      setError(requestError.message)
      if (!automatic) submissionStartedRef.current = false
    } finally {
      setIsSubmitting(false)
    }
  }, [originalText, startedAt, timedDuration])

  useEffect(() => {
    if (!startedAt || result || isSubmitting) return undefined

    const updateTimer = () => {
      const elapsed = (performance.now() - startPerformanceRef.current) / 1000
      setElapsedSeconds(elapsed)

      if (timedDuration) {
        const remaining = Math.max(0, timedDuration - elapsed)
        setRemainingSeconds(remaining)
        if (remaining <= 0) submitAttempt(typedText, true)
      }
    }

    const intervalId = window.setInterval(updateTimer, 100)
    return () => window.clearInterval(intervalId)
  }, [isSubmitting, result, startedAt, submitAttempt, timedDuration, typedText])

  const resetAttempt = () => {
    setTypedText('')
    setStartedAt(null)
    setElapsedSeconds(0)
    setRemainingSeconds(timedDuration)
    setIsSubmitting(false)
    setResult(null)
    setError('')
    setCompletionAnnouncement('')
    startPerformanceRef.current = null
    submissionStartedRef.current = false
  }

  const handleTyping = (event) => {
    if (isSubmitting || result) return

    const nextText = event.target.value.slice(0, originalText.length)
    let attemptStartedAt = startedAt

    if (!startedAt && nextText.length > 0) {
      console.log('Test started')
      console.log('Timer started')
      console.log('User started typing')
      attemptStartedAt = new Date().toISOString()
      startPerformanceRef.current = performance.now()
      setStartedAt(attemptStartedAt)
      if (timedDuration) setRemainingSeconds(timedDuration)
    }

    setTypedText(nextText)

    if (testMode === 'complete' && nextText.length === originalText.length && attemptStartedAt) {
      console.log('Test completed')
      submissionStartedRef.current = true
      setIsSubmitting(true)
      setError('')
      setElapsedSeconds((performance.now() - startPerformanceRef.current) / 1000)
      analyzeTyping({
        originalText,
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
    resetAttempt()
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value)
    setPassageIndex(0)
    resetAttempt()
  }

  const handleTestModeChange = (event) => {
    const nextMode = event.target.value
    setTestMode(nextMode)
    resetAttempt()
    const nextDuration = TEST_MODES.find((mode) => mode.value === nextMode)?.duration ?? null
    setRemainingSeconds(nextDuration)
  }

  const handleNewPassage = () => {
    const passages = PASSAGES[difficulty]
    setPassageIndex((currentIndex) => (currentIndex + 1) % passages.length)
    resetAttempt()
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  const testEnded = isSubmitting || Boolean(result) || Boolean(completionAnnouncement)
  const displayedTime = timedDuration ? (remainingSeconds ?? timedDuration) : elapsedSeconds

  return (
    <div className="app-page">
      <LandingHero />
      <main className="app-shell">
        <FeaturesSection />
        <WhyChooseSection />
        <BenefitsSection />

        <section id="typing-test" className="typing-section content-shell" aria-labelledby="typing-section-heading">
          <div className="section-heading typing-section-heading">
            <p className="eyebrow">Ready when you are</p>
            <h2 id="typing-section-heading">Take the Typing Speed Test</h2>
            <p>Type the passage exactly as shown. Your result is analysed when you finish.</p>
          </div>

          <TestSettings
            difficulty={difficulty}
            testMode={testMode}
            onDifficultyChange={handleDifficultyChange}
            onTestModeChange={handleTestModeChange}
            onNewPassage={handleNewPassage}
            disabled={isSubmitting}
          />

          <section className="practice-card" aria-labelledby="practice-heading" aria-busy={isSubmitting}>
            <div className="practice-heading-row">
              <h2 id="practice-heading">Practice passage</h2>
              <div className="live-stats">
                <span>
                  <strong>{displayedTime.toFixed(1)}</strong>
                  <small>{timedDuration ? 'seconds remaining' : 'seconds elapsed'}</small>
                </span>
                <span><strong>{typedText.length} / {originalText.length}</strong><small>characters</small></span>
              </div>
            </div>

            <TypingPassage
              originalText={originalText}
              typedText={typedText}
              comparisonItems={result?.comparisonItems ?? result?.comparisonDetails ?? result?.mistakeDetails}
            />
            <div
              className="typing-progress"
              role="progressbar"
              aria-label="Typing progress"
              aria-valuemin="0"
              aria-valuemax={originalText.length}
              aria-valuenow={typedText.length}
            >
              <span style={{ width: `${(typedText.length / originalText.length) * 100}%` }} />
            </div>
            <TypingInput
              ref={inputRef}
              value={typedText}
              onChange={handleTyping}
              disabled={testEnded}
              maxLength={originalText.length}
            />
            <TestControls
              hasStarted={Boolean(startedAt)}
              isSubmitting={isSubmitting}
              hasResult={Boolean(result) || Boolean(completionAnnouncement)}
              onFinish={() => submitAttempt(typedText)}
              onRestart={restartTest}
            />
          </section>

          <p className="sr-only" aria-live="assertive">{completionAnnouncement}</p>
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
        </section>

        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
