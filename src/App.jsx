import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import CoachRecommendation from './components/CoachRecommendation'
import ErrorMessage from './components/ErrorMessage'
import ProgressDashboard from './components/ProgressDashboard'
import ResultsPanel from './components/ResultsPanel'
import TestControls from './components/TestControls'
import TestSettings from './components/TestSettings'
import TypingInput from './components/TypingInput'
import TypingPassage from './components/TypingPassage'
import { CATEGORIES, DIFFICULTIES } from './data/passages'
import { analyzeTyping } from './services/typingApi'
import { createCoachRecommendation } from './services/recommendationEngine'
import { loadRecommendation, saveRecommendation } from './services/recommendationStorage'
import { loadPracticeSettings, savePracticeSettings } from './services/practiceStorage'
import { loadProgress, saveProgress, updateProgress } from './services/progressStorage'
import { getAttemptedOriginalText } from './utils/alignText'
import { selectPassage } from './utils/passageSelection'

const validDifficulties = DIFFICULTIES.map((item) => item.value)

function App() {
  const [initialPractice] = useState(() => loadPracticeSettings(validDifficulties, CATEGORIES))
  const [difficulty, setDifficulty] = useState(initialPractice.difficulty)
  const [category, setCategory] = useState(initialPractice.category)
  const [testMode, setTestMode] = useState(initialPractice.testMode)
  const [customDuration, setCustomDuration] = useState(initialPractice.customDuration)
  const [currentPassage, setCurrentPassage] = useState(() => selectPassage({
    category: initialPractice.category,
    difficulty: initialPractice.difficulty,
    lastPassageId: initialPractice.lastPassageId,
  }))
  const [typedText, setTypedText] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [completionAnnouncement, setCompletionAnnouncement] = useState('')
  const [storedRecommendation, setStoredRecommendation] = useState(loadRecommendation)
  const [progress, setProgress] = useState(loadProgress)
  const startPerformanceRef = useRef(null)
  const submissionStartedRef = useRef(false)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const settingsRef = useRef(null)

  const originalText = currentPassage?.text ?? ''
  const timedDuration = testMode === 'complete'
    ? null
    : testMode === 'custom'
      ? customDuration
      : Number(testMode)
  const recommendation = useMemo(
    () => (result ? createCoachRecommendation(result, difficulty, category) : null),
    [category, difficulty, result],
  )

  useEffect(() => {
    console.log('Application loaded')
  }, [])

  useEffect(() => {
    savePracticeSettings({
      difficulty,
      category,
      testMode,
      customDuration,
      lastPassageId: currentPassage?.id ?? null,
    })
  }, [category, currentPassage?.id, customDuration, difficulty, testMode])

  useEffect(() => {
    if (result) {
      console.log('Result displayed')
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [result])

  useEffect(() => {
    if (recommendation) saveRecommendation(recommendation)
  }, [recommendation])

  const handleAnalysisResult = useCallback((analysis, submittedText) => {
    setResult(analysis)
    setProgress((currentProgress) => {
      const nextProgress = updateProgress(currentProgress, analysis, submittedText.length)
      saveProgress(nextProgress)
      return nextProgress
    })
  }, [])

  const submitAttempt = useCallback(async (textToSubmit, automatic = false) => {
    if (!startedAt || submissionStartedRef.current || textToSubmit.length === 0) return

    console.log('Test completed')
    submissionStartedRef.current = true
    setIsSubmitting(true)
    setError('')
    setElapsedSeconds((performance.now() - startPerformanceRef.current) / 1000)

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
      handleAnalysisResult(analysis, textToSubmit)
    } catch (requestError) {
      setError(requestError.message)
      if (!automatic) submissionStartedRef.current = false
    } finally {
      setIsSubmitting(false)
    }
  }, [handleAnalysisResult, originalText, startedAt, timedDuration])

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

  const resetAttempt = (nextDuration = timedDuration) => {
    setTypedText('')
    setStartedAt(null)
    setElapsedSeconds(0)
    setRemainingSeconds(nextDuration)
    setIsSubmitting(false)
    setResult(null)
    setError('')
    setCompletionAnnouncement('')
    startPerformanceRef.current = null
    submissionStartedRef.current = false
  }

  const canDiscardActiveTest = () =>
    !startedAt || Boolean(result) || window.confirm('Discard the current typing test and load new practice?')

  const loadPractice = ({
    nextDifficulty = difficulty,
    nextCategory = category,
    nextMode = testMode,
    nextCustomDuration = customDuration,
  }) => {
    const nextPassage = selectPassage({
      category: nextCategory,
      difficulty: nextDifficulty,
      lastPassageId: currentPassage?.id,
    })
    const nextDuration = nextMode === 'complete'
      ? null
      : nextMode === 'custom'
        ? nextCustomDuration
        : Number(nextMode)

    setDifficulty(nextDifficulty)
    setCategory(nextCategory)
    setTestMode(nextMode)
    setCustomDuration(nextCustomDuration)
    setCurrentPassage(nextPassage)
    resetAttempt(nextDuration)
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
      setStoredRecommendation(null)
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
        .then((analysis) => handleAnalysisResult(analysis, nextText))
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

  const changePracticeOption = (changes) => {
    if (!canDiscardActiveTest()) return
    loadPractice(changes)
  }

  const handleCustomDurationChange = (event) => {
    if (!canDiscardActiveTest()) return
    const requestedDuration = Number(event.target.value)
    const validDuration = requestedDuration >= 15 && requestedDuration <= 300 ? requestedDuration : 60
    loadPractice({ nextMode: 'custom', nextCustomDuration: validDuration })
  }

  const handleNewPassage = () => {
    if (!canDiscardActiveTest()) return
    loadPractice({})
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  const continueRecommendedPractice = (nextRecommendation) => {
    const nextMode = String(nextRecommendation.suggestedDuration)
    loadPractice({
      nextDifficulty: nextRecommendation.nextDifficulty,
      nextCategory: nextRecommendation.suggestedCategory,
      nextMode,
    })
    setStoredRecommendation(null)
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  const testEnded = isSubmitting || Boolean(result) || Boolean(completionAnnouncement)
  const displayedTime = timedDuration ? (remainingSeconds ?? timedDuration) : elapsedSeconds
  const levelLabel = DIFFICULTIES.find((item) => item.value === difficulty)?.label

  return (
    <div className="app-page compact-app">
      <header className="compact-header">
        <div className="content-shell compact-header-inner">
          <div>
            <p className="eyebrow">Accuracy first. Speed follows.</p>
            <h1>Typing Coach</h1>
          </div>
          <p>Focused practice with clear feedback and a recommended next step.</p>
        </div>
      </header>

      <main className="compact-main content-shell">
        {storedRecommendation && !result && (
          <aside className="welcome-back" aria-labelledby="welcome-back-heading">
            <div>
              <p className="eyebrow">Welcome back</p>
              <h2 id="welcome-back-heading">Your recommended next practice is ready.</h2>
              <dl className="welcome-plan">
                <div><dt>Level</dt><dd>{DIFFICULTIES.find((item) => item.value === storedRecommendation.nextDifficulty)?.label}</dd></div>
                <div><dt>Category</dt><dd>{storedRecommendation.suggestedCategory}</dd></div>
                <div><dt>Duration</dt><dd>{storedRecommendation.suggestedDuration} seconds</dd></div>
              </dl>
            </div>
            <div className="welcome-actions">
              <button className="button button-primary" type="button" onClick={() => continueRecommendedPractice(storedRecommendation)}>Continue Recommendation</button>
              <button className="button button-secondary" type="button" onClick={() => settingsRef.current?.scrollIntoView?.({ behavior: 'smooth' })}>Choose Another Practice</button>
            </div>
          </aside>
        )}

        <ProgressDashboard
          progress={progress}
          difficulty={difficulty}
          recommendation={recommendation ?? storedRecommendation}
        />

        <div ref={settingsRef}>
          <TestSettings
            difficulty={difficulty}
            category={category}
            testMode={testMode}
            customDuration={customDuration}
            onDifficultyChange={(event) => changePracticeOption({ nextDifficulty: event.target.value })}
            onCategoryChange={(event) => changePracticeOption({ nextCategory: event.target.value })}
            onTestModeChange={(event) => changePracticeOption({ nextMode: event.target.value })}
            onCustomDurationChange={handleCustomDurationChange}
            onNewPassage={handleNewPassage}
            disabled={isSubmitting}
          />
        </div>

        <section className="practice-card" aria-labelledby="practice-heading" aria-busy={isSubmitting}>
          <div className="practice-heading-row">
            <div>
              <p className="practice-context">{levelLabel} · {category}</p>
              <h2 id="practice-heading">Practice passage</h2>
            </div>
            <div className="live-stats">
              <span><strong>{displayedTime.toFixed(1)}</strong><small>{timedDuration ? 'seconds remaining' : 'seconds elapsed'}</small></span>
              <span><strong>{typedText.length} / {originalText.length}</strong><small>characters</small></span>
            </div>
          </div>

          {!startedAt && !result && <p className="start-prompt" role="status">Start typing to begin</p>}
          <TypingPassage
            originalText={originalText}
            typedText={typedText}
            comparisonItems={result?.comparisonItems ?? result?.comparisonDetails ?? result?.mistakeDetails}
          />
          <TypingInput ref={inputRef} value={typedText} onChange={handleTyping} disabled={testEnded} maxLength={originalText.length} />
          <div className="typing-progress" role="progressbar" aria-label="Typing progress" aria-valuemin="0" aria-valuemax={originalText.length} aria-valuenow={typedText.length}>
            <span style={{ width: `${(typedText.length / originalText.length) * 100}%` }} />
          </div>
          <TestControls hasStarted={Boolean(startedAt)} isSubmitting={isSubmitting} hasResult={Boolean(result) || Boolean(completionAnnouncement)} onFinish={() => submitAttempt(typedText)} onRestart={restartTest} />
        </section>

        <p className="sr-only" aria-live="assertive">{completionAnnouncement}</p>
        {isSubmitting && <div className="notification notification-loading" role="status" aria-live="polite"><span className="loading-spinner" aria-hidden="true" /><div><strong>Analysing your typing...</strong><span>Your results will be ready in a moment.</span></div></div>}
        <ErrorMessage message={error} />
        {result && (
          <>
            <div className="notification notification-success" role="status"><span className="notification-icon" aria-hidden="true">✓</span><div><strong>Analysis complete</strong><span>Your typing results are ready.</span></div></div>
            <ResultsPanel ref={resultsRef} result={result} />
            <CoachRecommendation recommendation={recommendation} onContinue={() => continueRecommendedPractice(recommendation)} onPracticeAgain={restartTest} />
          </>
        )}
      </main>

      <footer className="compact-footer"><div className="content-shell"><strong>Typing Coach</strong><span>Practice deliberately. Improve consistently.</span></div></footer>
    </div>
  )
}

export default App
