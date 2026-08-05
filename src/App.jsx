import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import AboutPage from './components/AboutPage'
import CoachRecommendation from './components/CoachRecommendation'
import ErrorMessage from './components/ErrorMessage'
import LandingHero from './components/LandingHero'
import NotFoundPage from './components/NotFoundPage'
import PracticeSession from './components/PracticeSession'
import PreviousTestComparison from './components/PreviousTestComparison'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import ProgressDashboard from './components/ProgressDashboard'
import ResultsPanel from './components/ResultsPanel'
import SeoContent from './components/SeoContent'
import SiteFooter from './components/SiteFooter'
import TestSettings from './components/TestSettings'
import TypingJourney from './components/TypingJourney'
import WeakKeyCoach from './components/WeakKeyCoach'
import WhyTypingCoach from './components/WhyTypingCoach'
import { CATEGORIES, DIFFICULTIES } from './data/passages'
import { analyzeTyping } from './services/typingApi'
import { createCoachRecommendation } from './services/recommendationEngine'
import { loadRecommendation, saveRecommendation } from './services/recommendationStorage'
import { loadPracticeSettings, savePracticeSettings } from './services/practiceStorage'
import { createSessionSnapshot, loadPreviousSession, savePreviousSession } from './services/previousSessionStorage'
import { loadProgress, saveProgress, updateProgress } from './services/progressStorage'
import { getAttemptedOriginalText } from './utils/alignText'
import { selectPassage } from './utils/passageSelection'
import { buildWeakKeyPassage } from './utils/weakKeyPractice'

const validDifficulties = DIFFICULTIES.map((item) => item.value)
const SERVICE_WAKE_DELAY_MS = 4000
const MOBILE_RESULTS_BREAKPOINT = 720
const PASSAGE_SEPARATOR = ' '
const TIMED_TEXT_BUFFER_CHARACTERS = 32

function TypingCoachHome() {
  const [initialPractice] = useState(() => loadPracticeSettings(validDifficulties, CATEGORIES))
  const [difficulty, setDifficulty] = useState(initialPractice.difficulty)
  const [category, setCategory] = useState(initialPractice.category)
  const [testMode, setTestMode] = useState(initialPractice.testMode)
  const [customDuration, setCustomDuration] = useState(initialPractice.customDuration)
  const [customDurationError, setCustomDurationError] = useState('')
  const [currentPassage, setCurrentPassage] = useState(() => selectPassage({
    category: initialPractice.category,
    difficulty: initialPractice.difficulty,
    lastPassageId: initialPractice.lastPassageId,
  }))
  const [sessionPassages, setSessionPassages] = useState(() => [currentPassage])
  const [typedText, setTypedText] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isServiceWaking, setIsServiceWaking] = useState(false)
  const [pendingSessionChange, setPendingSessionChange] = useState(null)
  const [completionAnnouncement, setCompletionAnnouncement] = useState('')
  const [hasTimedSessionEnded, setHasTimedSessionEnded] = useState(false)
  const [storedRecommendation, setStoredRecommendation] = useState(loadRecommendation)
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState(false)
  const [progress, setProgress] = useState(loadProgress)
  const [sessionComparison, setSessionComparison] = useState(null)
  const startPerformanceRef = useRef(null)
  const submissionStartedRef = useRef(false)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const settingsRef = useRef(null)

  const originalText = sessionPassages.map((passage) => passage.text).join(PASSAGE_SEPARATOR)
  const timedDuration = testMode === 'complete'
    ? null
    : testMode === 'custom'
      ? Number(customDuration) >= 15 && Number(customDuration) <= 300 ? Number(customDuration) : 60
      : Number(testMode)
  const recommendation = useMemo(
    () => (result ? createCoachRecommendation(result, difficulty, category) : null),
    [category, difficulty, result],
  )

  useEffect(() => {
    window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
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
      window.requestAnimationFrame(() => {
        resultsRef.current?.focus?.({ preventScroll: true })
        if (window.innerWidth <= MOBILE_RESULTS_BREAKPOINT) resultsRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [result])

  useEffect(() => {
    if (recommendation) saveRecommendation(recommendation)
  }, [recommendation])

  useEffect(() => {
    if (!isSubmitting) return undefined
    const wakingTimer = window.setTimeout(() => setIsServiceWaking(true), SERVICE_WAKE_DELAY_MS)
    return () => window.clearTimeout(wakingTimer)
  }, [isSubmitting])

  const handleAnalysisResult = useCallback((analysis, submittedText) => {
    const currentSession = createSessionSnapshot(analysis, {
      difficulty,
      category,
      duration: timedDuration ?? analysis.durationInSeconds,
    })
    setSessionComparison({ currentSession, previousSession: loadPreviousSession() })
    savePreviousSession(currentSession)
    setResult(analysis)
    setProgress((currentProgress) => {
      const nextProgress = updateProgress(currentProgress, analysis, submittedText.length)
      saveProgress(nextProgress)
      return nextProgress
    })
  }, [category, difficulty, timedDuration])

  const submitAttempt = useCallback(async (textToSubmit, automatic = false, attemptStartedAt = startedAt) => {
    if (!attemptStartedAt || submissionStartedRef.current || textToSubmit.length === 0) return

    submissionStartedRef.current = true
    setIsSubmitting(true)
    setIsServiceWaking(false)
    setError('')
    setElapsedSeconds((performance.now() - startPerformanceRef.current) / 1000)

    if (automatic && timedDuration) {
      setHasTimedSessionEnded(true)
      setCompletionAnnouncement('Time is up. Your practice was submitted automatically.')
    }

    const requestOriginalText = timedDuration
      ? getAttemptedOriginalText(originalText, textToSubmit)
      : originalText

    try {
      const analysis = await analyzeTyping({
        originalText: requestOriginalText,
        typedText: textToSubmit,
        startedAt: attemptStartedAt,
        completedAt: new Date().toISOString(),
      })
      handleAnalysisResult(analysis, textToSubmit)
    } catch (requestError) {
      setError(requestError.message)
      submissionStartedRef.current = false
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

  const resetAttempt = (nextDuration = timedDuration, nextPassages = [currentPassage]) => {
    setSessionPassages(nextPassages.filter(Boolean))
    setTypedText('')
    setStartedAt(null)
    setElapsedSeconds(0)
    setRemainingSeconds(nextDuration)
    setIsSubmitting(false)
    setResult(null)
    setError('')
    setIsServiceWaking(false)
    setPendingSessionChange(null)
    setCompletionAnnouncement('')
    setHasTimedSessionEnded(false)
    startPerformanceRef.current = null
    submissionStartedRef.current = false
  }

  const requestSessionChange = (action, description) => {
    if (!startedAt || result) return action()
    setPendingSessionChange({ action, description })
  }

  const discardAndContinue = () => {
    const action = pendingSessionChange?.action
    setPendingSessionChange(null)
    action?.()
  }

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
        ? Number(nextCustomDuration) >= 15 && Number(nextCustomDuration) <= 300
          ? Number(nextCustomDuration)
          : 60
        : Number(nextMode)

    setDifficulty(nextDifficulty)
    setCategory(nextCategory)
    setTestMode(nextMode)
    setCustomDuration(nextCustomDuration)
    setCustomDurationError('')
    setCurrentPassage(nextPassage)
    resetAttempt(nextDuration, [nextPassage])
  }

  const ensureTimedTextBuffer = (typedLength) => {
    if (!timedDuration || hasTimedSessionEnded) return
    if (originalText.length - typedLength > TIMED_TEXT_BUFFER_CHARACTERS) return

    setSessionPassages((currentSequence) => {
      const lastPassage = currentSequence[currentSequence.length - 1]
      const nextPassage = selectPassage({ category, difficulty, lastPassageId: lastPassage?.id })
      return nextPassage ? [...currentSequence, nextPassage] : currentSequence
    })
  }

  const handleTyping = (event) => {
    if (isSubmitting || result) return
    const nextText = event.target.value.slice(0, originalText.length)
    let attemptStartedAt = startedAt

    if (!startedAt && nextText.length > 0) {
      attemptStartedAt = new Date().toISOString()
      startPerformanceRef.current = performance.now()
      setStartedAt(attemptStartedAt)
      setStoredRecommendation(null)
      if (timedDuration) setRemainingSeconds(timedDuration)
    }

    ensureTimedTextBuffer(nextText.length)
    setTypedText(nextText)

    if (testMode === 'complete' && nextText.length === originalText.length && attemptStartedAt) {
      submitAttempt(nextText, false, attemptStartedAt)
    }
  }

  const restartTest = () => {
    resetAttempt(timedDuration, [currentPassage])
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  const changePracticeOption = (changes) => {
    requestSessionChange(() => loadPractice(changes), 'change your practice settings')
  }

  const handleCustomDurationChange = (event) => {
    const requestedValue = event.target.value
    const requestedDuration = Number(requestedValue)
    const validationMessage = requestedValue === ''
      ? 'Enter a duration from 15 to 300 seconds.'
      : requestedDuration < 15
        ? 'Duration must be at least 15 seconds.'
        : requestedDuration > 300
          ? 'Duration must be 300 seconds or less.'
          : ''
    requestSessionChange(() => {
      loadPractice({ nextMode: 'custom', nextCustomDuration: requestedValue })
      setCustomDurationError(validationMessage)
    }, 'change the practice duration')
  }

  const handleNewPassage = () => {
    requestSessionChange(() => {
      loadPractice({})
      window.requestAnimationFrame(() => inputRef.current?.focus())
    }, 'load a new passage')
  }

  const continueRecommendedPractice = (nextRecommendation) => {
    const changes = {}
    if (nextRecommendation?.nextDifficulty) changes.nextDifficulty = nextRecommendation.nextDifficulty
    if (nextRecommendation?.suggestedCategory) changes.nextCategory = nextRecommendation.suggestedCategory
    if (nextRecommendation?.suggestedDuration != null) changes.nextMode = String(nextRecommendation.suggestedDuration)
    loadPractice(changes)
    setStoredRecommendation(nextRecommendation)
    setIsWelcomeDismissed(true)
    setCompletionAnnouncement('Recommended practice loaded')
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  const retryAnalysis = () => submitAttempt(typedText)

  const practiceWeakKeys = (suggestedWords) => {
    const practiceText = buildWeakKeyPassage(suggestedWords)
    if (!practiceText) return

    setCategory('Weak Keys')
    setTestMode('60')
    const weakKeyPassage = {
      id: `weak-keys-${Date.now()}`,
      category: 'Weak Keys',
      difficulty,
      text: practiceText,
    }
    setCurrentPassage(weakKeyPassage)
    setStoredRecommendation(null)
    resetAttempt(60, [weakKeyPassage])
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  const chooseAnotherPractice = () => {
    resetAttempt(timedDuration, [currentPassage])
    setCompletionAnnouncement('Practice settings ready. Choose a different level, topic or test length.')
    window.requestAnimationFrame(() => {
      settingsRef.current?.focus?.({ preventScroll: true })
      settingsRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    })
  }

  const testEnded = isSubmitting || Boolean(result) || hasTimedSessionEnded
  const displayedTime = timedDuration ? (remainingSeconds ?? timedDuration) : elapsedSeconds
  const levelLabel = DIFFICULTIES.find((item) => item.value === difficulty)?.label

  return (
    <div className="app-page compact-app">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <LandingHero />

      <main id="main-content" className="compact-main content-shell" tabIndex="-1">
        {storedRecommendation && !result && !isWelcomeDismissed && (
          <aside className="welcome-back" aria-labelledby="welcome-back-heading">
            <div>
              <p className="eyebrow">Welcome back</p>
              <h2 id="welcome-back-heading">Your recommended next practice is ready.</h2>
              <dl className="welcome-plan">
                {storedRecommendation.nextDifficulty && <div><dt>Level</dt><dd>{storedRecommendation.nextDifficulty.charAt(0) + storedRecommendation.nextDifficulty.slice(1).toLowerCase()}</dd></div>}
                {storedRecommendation.suggestedCategory && <div><dt>Topic</dt><dd>{storedRecommendation.suggestedCategory}</dd></div>}
                {storedRecommendation.suggestedDuration != null && <div><dt>Duration</dt><dd>{storedRecommendation.suggestedDuration} seconds</dd></div>}
              </dl>
            </div>
            <div className="welcome-actions">
              <button className="button button-primary" type="button" onClick={() => continueRecommendedPractice(storedRecommendation)}>Continue</button>
              <button className="button button-secondary" type="button" onClick={() => setIsWelcomeDismissed(true)}>Dismiss</button>
            </div>
          </aside>
        )}

        <div id="typing-test" ref={settingsRef} className="settings-focus-target" tabIndex="-1">
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
            recommendation={recommendation ?? storedRecommendation}
            customDurationError={customDurationError}
            sessionVersion={`${Boolean(startedAt)}:${currentPassage?.id ?? ''}`}
            disabled={isSubmitting}
          />
          {pendingSessionChange && (
            <div className="session-confirmation" role="alert" aria-labelledby="session-confirmation-title" aria-describedby="session-confirmation-description">
              <div><strong id="session-confirmation-title">Keep your current practice?</strong><span id="session-confirmation-description">Your current progress will be cleared if you {pendingSessionChange.description}.</span></div>
              <div className="session-confirmation-actions">
                <button className="button button-secondary" type="button" onClick={() => setPendingSessionChange(null)}>Continue Current Practice</button>
                <button className="button button-danger" type="button" onClick={discardAndContinue}>Discard and Change Settings</button>
              </div>
            </div>
          )}
        </div>

        <PracticeSession
          category={category}
          comparisonItems={result?.comparisonItems ?? result?.comparisonDetails ?? result?.mistakeDetails}
          displayedTime={displayedTime}
          error={error}
          inputRef={inputRef}
          isSubmitting={isSubmitting}
          levelLabel={levelLabel}
          onFinish={() => submitAttempt(typedText)}
          onRestart={restartTest}
          onTyping={handleTyping}
          originalText={originalText}
          result={result}
          testEnded={testEnded}
          timedDuration={timedDuration}
          typedText={typedText}
        />

        <p className="sr-only" aria-live="assertive">{completionAnnouncement}</p>
        {isSubmitting && (
          <div className="notification notification-loading" role="status" aria-live="polite" aria-atomic="true">
            <span className="loading-spinner" aria-hidden="true" />
            <div>
              <strong>{isServiceWaking ? 'Preparing your analysis...' : 'Analysing your typing...'}</strong>
              <span>{isServiceWaking ? 'The analysis service is starting. This may take a few moments.' : 'Checking accuracy, speed, and mistakes.'}</span>
            </div>
          </div>
        )}
        <ErrorMessage message={error} onRetry={retryAnalysis} onRestart={restartTest} />
        {result && (
          <>
            <div className="notification notification-success" role="status"><span className="notification-icon" aria-hidden="true">✓</span><div><strong>Practice analysed</strong><span>Your improvement insights are ready.</span></div></div>
            <ResultsPanel ref={resultsRef} result={result}>
              {sessionComparison && <PreviousTestComparison currentSession={sessionComparison.currentSession} previousSession={sessionComparison.previousSession} />}
              <CoachRecommendation recommendation={recommendation} onContinue={() => continueRecommendedPractice(recommendation)} onPracticeAgain={restartTest} onChooseAnother={chooseAnotherPractice} />
            </ResultsPanel>
            <WeakKeyCoach result={result} onPractice={practiceWeakKeys} />
          </>
        )}

        <ProgressDashboard
          progress={progress}
          difficulty={difficulty}
        />

        <WhyTypingCoach />
        <SeoContent />
        <TypingJourney />
      </main>

      <SiteFooter />
    </div>
  )
}

function App() {
  const path = window.location.pathname.replace(/\/$/, '')
  if (path === '') return <TypingCoachHome />
  if (path === '/about') return <AboutPage />
  if (path === '/privacy') return <PrivacyPolicyPage />
  return <NotFoundPage />
}

export default App
