import { useCallback, useEffect, useRef, useState } from 'react'
import SiteFooter from './SiteFooter'
import { generateLearningExercises, LEARNING_API_ERROR } from '../services/learningApi'
import { loadLearningProgress, saveLessonProgress } from '../services/learningProgressStorage'
import { calculateAccuracy } from '../utils/homeRowLesson'
import { buildMiniChallenges, buildMovementExercises, buildWarmups, buildWordPractice, validateLearnedContent } from '../utils/lessonExerciseGenerator'

const PHASES = ['learn', 'warmup', 'movement', 'words', 'challenge', 'recovery', 'review']
const DETAILS = {
  learn: ['Learn', 'Finger placement, movement, and common mistakes', '2–3 min'], warmup: ['Warm-up', 'Build relaxed, accurate repetition', '2–3 min'],
  movement: ['Movement Practice', 'Coordinate movement and return', '4–5 min'], words: ['Word Practice', 'Apply learned keys with increasing difficulty', '5 min'],
  challenge: ['Mini Challenge', 'Mix everything you have learned', 'Apply'], recovery: ['Weak Key Recovery', 'Strengthen the key that needs attention', 'As needed'],
  review: ['Lesson Review', 'Review progress and choose what comes next', 'Complete'],
}
const TYPE_PHASE = { WARM_UP: 'warmup', WARMUP: 'warmup', MOVEMENT: 'movement', MOVEMENT_PRACTICE: 'movement', WORD: 'words', WORD_PRACTICE: 'words', MINI_CHALLENGE: 'challenge', CHALLENGE: 'challenge', WEAK_KEY_RECOVERY: 'recovery' }
const API_LESSON_IDS = { 'home-row': 'HOME_ROW_1', 'top-row-e-i': 'TOP_ROW_E_I_2', 'bottom-row-c-n': 'BOTTOM_ROW_C_N_3' }
const DURATIONS = [[5, 'Quick Practice'], [15, 'Standard Lesson'], [20, 'Deep Practice']]
const WEAK_KEY_THRESHOLD = 3

const score = (key, correct, mistakes) => (correct[key] ?? 0) - (mistakes[key] ?? 0)

function offlineExercises(config) {
  const movement = buildMovementExercises(config.movementKeys)
  const groups = [
    ['WARM_UP', buildWarmups(config.focusKeys)], ['MOVEMENT_PRACTICE', movement],
    ['WORD_PRACTICE', buildWordPractice(config.wordBank)], ['MINI_CHALLENGE', buildMiniChallenges(config.wordBank, movement)],
  ]
  const content = groups.flatMap(([type, items]) => items.map((item, index) => ({ id: `offline-${type}-${index}`, content: item, type })))
  if (!validateLearnedContent(content.map(({ content: item }) => item), config.learnedKeys)) throw new Error(`${config.title} contains an untaught key.`)
  return content
}

export default function GuidedLessonSession({ config, FingerGuide }) {
  const saved = loadLearningProgress().lessons[config.lessonId] ?? {}
  const [duration, setDuration] = useState(saved.selectedSessionDuration ?? 15)
  const [phase, setPhase] = useState('learn')
  const [exercises, setExercises] = useState([])
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [correctCharacters, setCorrectCharacters] = useState(0)
  const [totalCharacters, setTotalCharacters] = useState(0)
  const [mistakes, setMistakes] = useState({})
  const [correctByKey, setCorrectByKey] = useState({})
  const [exerciseMistakes, setExerciseMistakes] = useState(0)
  const [completedIds, setCompletedIds] = useState([])
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [weakKeys, setWeakKeys] = useState(saved.weakKeys ?? [])
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [timeSpent, setTimeSpent] = useState(0)
  const completedIdsRef = useRef([])
  const weakKeysRef = useRef(saved.weakKeys ?? [])
  const requestInFlight = useRef(false)
  const abortRef = useRef(null)
  const inputRef = useRef(null)
  const exercise = exercises[index]
  const accuracy = calculateAccuracy(correctCharacters, totalCharacters)
  const weakestKey = [...config.focusKeys].sort((a, b) => score(a, correctByKey, mistakes) - score(b, correctByKey, mistakes))[0]
  const strongestKey = [...config.learnedKeys].filter((key) => key !== ' ').sort((a, b) => score(b, correctByKey, mistakes) - score(a, correctByKey, mistakes))[0] ?? config.focusKeys[0]
  const mastered = completedIds.length >= 8 && accuracy >= 95 && weakKeys.length === 0
  const mismatch = exercise ? Array.from(typed).findIndex((char, offset) => char !== exercise.content[offset]) : -1
  const currentKey = exercise?.content[mismatch >= 0 ? mismatch : typed.length]
  const progress = exercise ? Math.min(100, Math.round((typed.length / exercise.content.length) * 100)) : 0

  const payload = useCallback((exerciseType) => ({
    lessonId: config.apiLessonId ?? API_LESSON_IDS[config.lessonId] ?? config.lessonId.toUpperCase(),
    learnedKeys: Array.from(config.learnedKeys), weakKeys: weakKeysRef.current, exerciseType, difficulty: 'BEGINNER',
    sessionDurationMinutes: duration, previousExerciseIds: completedIdsRef.current,
  }), [config, duration])

  const requestBatch = useCallback(async (exerciseType = 'MIXED', replace = false) => {
    if (requestInFlight.current) return false
    requestInFlight.current = true; setLoading(true); setError('')
    const controller = new AbortController(); abortRef.current = controller
    try {
      const batch = await generateLearningExercises(payload(exerciseType), { signal: controller.signal })
      setExercises((current) => {
        const existing = new Set([...completedIdsRef.current, ...current.map(({ id }) => id)])
        const unique = batch.filter(({ id }) => !existing.has(id))
        return replace ? batch : [...current, ...unique]
      })
      if (replace) { setIndex(0); setStartedAt(Date.now()); setPhase(TYPE_PHASE[batch[0].type] ?? 'warmup') }
      setAnnouncement('Your practice is ready.')
      return true
    } catch (requestError) {
      if (requestError.name !== 'AbortError') { setError(LEARNING_API_ERROR); setAnnouncement(LEARNING_API_ERROR) }
      return false
    } finally { requestInFlight.current = false; setLoading(false) }
  }, [payload])

  useEffect(() => () => abortRef.current?.abort(), [])
  useEffect(() => { if (exercise) inputRef.current?.focus() }, [exercise])
  useEffect(() => {
    if (!startedAt || phase === 'review') return undefined
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      setTimeSpent(elapsed)
      if (elapsed >= duration * 60) setPhase('review')
    }, 1000)
    return () => window.clearInterval(timer)
  }, [duration, phase, startedAt])
  useEffect(() => {
    if (phase !== 'review') return
    saveLessonProgress(config.lessonId, { completed: mastered, bestAccuracy: Math.max(saved.bestAccuracy ?? 0, accuracy), weakKeys, lastCompletedPhase: 'review', selectedSessionDuration: duration, masteryStatus: mastered ? 'mastered' : 'needs-practice' })
  }, [accuracy, config.lessonId, duration, mastered, phase, saved.bestAccuracy, weakKeys])

  const startSession = () => requestBatch('MIXED', true)
  const useOffline = () => { setExercises(offlineExercises(config)); setIndex(0); setPhase('warmup'); setStartedAt(Date.now()); setError(''); setAnnouncement('Offline practice started.') }
  const finish = () => { setTimeSpent(Math.max(1, Math.round((Date.now() - (startedAt ?? Date.now())) / 1000))); setPhase('review'); setTyped(''); setAnnouncement('Lesson Review started.') }

  const completeExercise = () => {
    const id = exercise.id
    const nextCompleted = [...completedIds, id]
    completedIdsRef.current = nextCompleted
    setCompletedIds(nextCompleted); setFeedback(exerciseMistakes ? 'Let’s reinforce that movement.' : '✓ Great!')
    if (TYPE_PHASE[exercise.type] === 'words') setWordsCompleted((count) => count + exercise.content.trim().split(/\s+/).length)
    const nextIndex = index + 1
    setIndex(nextIndex); setTyped(''); setExerciseMistakes(0)
    const next = exercises[nextIndex]
    if (next) setPhase(TYPE_PHASE[next.type] ?? phase)
    const remaining = exercises.length - nextIndex
    if (remaining <= 2) requestBatch(weakKeysRef.current.length ? 'WEAK_KEY_RECOVERY' : 'MIXED')
    if (!remaining && mastered) finish()
    setAnnouncement(`${exerciseMistakes ? 'Keep going.' : 'Great!'} Next exercise.`)
  }

  const handleInput = (event) => {
    const nextTyped = event.target.value
    if (nextTyped.length > typed.length) {
      const additions = nextTyped.slice(typed.length); let correct = 0; const newMistakes = {}; const newCorrect = {}
      Array.from(additions).forEach((character, offset) => {
        const expected = exercise.content[typed.length + offset]
        if (character === expected) { correct += 1; if (expected !== ' ') newCorrect[expected] = (newCorrect[expected] ?? 0) + 1 }
        else if (expected && expected !== ' ') newMistakes[expected] = (newMistakes[expected] ?? 0) + 1
      })
      setCorrectCharacters((count) => count + correct); setTotalCharacters((count) => count + additions.length)
      const addedMistakes = Object.values(newMistakes).reduce((sum, count) => sum + count, 0)
      setExerciseMistakes((count) => count + addedMistakes)
      setMistakes((current) => { const next = { ...current }; Object.entries(newMistakes).forEach(([key, count]) => { next[key] = (next[key] ?? 0) + count; if (next[key] >= WEAK_KEY_THRESHOLD && !weakKeysRef.current.includes(key)) { weakKeysRef.current = [...weakKeysRef.current, key]; setWeakKeys(weakKeysRef.current) } }); return next })
      setCorrectByKey((current) => { const next = { ...current }; Object.entries(newCorrect).forEach(([key, count]) => { next[key] = (next[key] ?? 0) + count }); return next })
    }
    setTyped(nextTyped); setFeedback('')
    if (nextTyped === exercise.content) completeExercise()
  }

  const reset = () => { abortRef.current?.abort(); requestInFlight.current = false; completedIdsRef.current = []; weakKeysRef.current = saved.weakKeys ?? []; setPhase('learn'); setExercises([]); setIndex(0); setTyped(''); setCorrectCharacters(0); setTotalCharacters(0); setMistakes({}); setCorrectByKey({}); setExerciseMistakes(0); setCompletedIds([]); setWordsCompleted(0); setWeakKeys(weakKeysRef.current); setFeedback(''); setError(''); setStartedAt(null); setTimeSpent(0) }
  const displayPhase = phase === 'learn' || phase === 'review' ? phase : (exercise ? TYPE_PHASE[exercise.type] ?? phase : phase)
  const [title, description, phaseDuration] = DETAILS[displayPhase]

  return <div className="app-page learn-page"><header className="lesson-header"><div className="content-shell lesson-header-inner"><nav aria-label={`${config.title} navigation`}><a href="/">Back to Practice</a><a href="/learn">Back to Build Muscle Memory</a>{config.previousHref && <a href={config.previousHref}>Previous Lesson</a>}</nav><p className="eyebrow">Lesson {config.lessonNumber}</p><h1>{config.title}</h1><p>{title} · Phase {PHASES.indexOf(displayPhase) + 1} of 7</p></div></header>
    <main className="content-shell lesson-main" id="main-content"><p className="sr-only" role="status" aria-live="polite">{announcement}</p><div className="lesson-phase-progress" aria-label="Lesson phases">{PHASES.map((item, phaseIndex) => <span className={phaseIndex <= PHASES.indexOf(displayPhase) ? 'is-reached' : ''} key={item}>{DETAILS[item][0]}</span>)}</div><div className={`lesson-stage-layout ${displayPhase === 'learn' || displayPhase === 'review' ? 'is-solo' : ''}`}>
      <section className="lesson-stage-card" aria-labelledby={`${config.lessonId}-phase-heading`}><div className="phase-heading"><div><h2 id={`${config.lessonId}-phase-heading`}>{title}</h2><p>{description}</p></div><span>{phaseDuration}</span></div>
        {displayPhase === 'learn' && <><div className="placement-instructions"><p className="lesson-introduction">{config.introduction}</p><div className="learning-notes"><section><h3>Finger placement</h3><p>{config.placement}</p></section><section><h3>Finger movement</h3><p>{config.movement}</p></section><section><h3>Home position</h3><p>{config.homePosition}</p></section><section><h3>Common mistakes</h3><p>{config.commonMistakes}</p></section></div></div><fieldset className="lesson-duration"><legend>Practice duration</legend>{DURATIONS.map(([minutes, label]) => <label key={minutes}><input type="radio" name={`${config.lessonId}-duration`} value={minutes} checked={duration === minutes} onChange={() => setDuration(minutes)} /><span>{label}<small>{minutes} minutes</small></span></label>)}</fieldset></>}
        {loading && !exercise && <p className="lesson-loading" role="status">Preparing your practice...</p>}
        {error && !exercise && <div className="lesson-load-error" role="alert"><p>{error}</p><div className="lesson-actions"><button className="button button-primary" type="button" onClick={startSession}>Retry</button><button className="button button-secondary" type="button" onClick={useOffline}>Use Offline Practice</button></div></div>}
        {exercise && <div className="guided-exercise">{feedback && <p className="exercise-feedback" role="status">{feedback}</p>}<p className="exercise-type">{DETAILS[displayPhase][0]}</p><p className="exercise-count">Exercise {completedIds.length + 1}</p><div className="exercise-target" aria-live="polite" aria-label={`Type: ${exercise.content}`}>{exercise.content}</div><dl className="exercise-live-feedback" aria-label="Live exercise feedback"><div><dt>Current key</dt><dd>{currentKey === ' ' ? 'Space' : currentKey?.toUpperCase() ?? 'Complete'}</dd></div><div><dt>Accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div><div><dt>Progress</dt><dd>{progress}%</dd></div></dl><p className="finger-instruction">{config.fingerInstructions[currentKey] ?? config.returnInstruction}</p>{weakKeys.length > 0 && <p className="weak-key-hint">Focus key: {weakKeys[0].toUpperCase()}</p>}<label htmlFor={`${config.lessonId}-input`}>Type the exercise</label><input id={`${config.lessonId}-input`} ref={inputRef} value={typed} maxLength={exercise.content.length} onChange={handleInput} onPaste={(event) => event.preventDefault()} autoComplete="off" autoCapitalize="off" spellCheck="false" /><p className="lesson-input-help">Use Backspace to correct a key. Focus on relaxed accuracy.</p></div>}
        {displayPhase === 'review' && <div className="lesson-result"><dl><div><dt>Time spent</dt><dd>{timeSpent} seconds</dd></div><div><dt>Accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div><div><dt>Exercises completed</dt><dd>{completedIds.length}</dd></div><div><dt>Words completed</dt><dd>{wordsCompleted}</dd></div><div><dt>Strongest key</dt><dd>{strongestKey.toUpperCase()}</dd></div><div><dt>Weakest key</dt><dd>{weakestKey.toUpperCase()}</dd></div><div><dt>Weak-key improvements</dt><dd>{weakKeys.length ? `${weakKeys.length} focus key${weakKeys.length === 1 ? '' : 's'} identified` : 'All focus keys steady'}</dd></div><div><dt>Mastery status</dt><dd>{mastered ? 'Mastered' : 'Keep building'}</dd></div></dl><div className="lesson-recommendation"><strong>Recommendation</strong><p>{mastered ? 'Continue when you can maintain the same relaxed accuracy.' : `Keep practicing ${weakestKey.toUpperCase()} with relaxed, accurate movement.`}</p></div></div>}
        <div className="lesson-actions">{displayPhase === 'learn' && !loading && !error && <button className="button button-primary" type="button" onClick={startSession}>Begin Warm-up</button>}{exercise && <><button className="button button-secondary" type="button" onClick={() => { setTyped(''); setExerciseMistakes(0); inputRef.current?.focus() }}>Retry Exercise</button><button className="button button-secondary" type="button" onClick={finish}>End Session</button></>}{displayPhase === 'review' && <><a className="button button-primary" href="/learn">Continue</a><button className="button button-secondary" type="button" onClick={reset}>Retry</button></>}</div>
      </section>{displayPhase !== 'learn' && displayPhase !== 'review' && <FingerGuide />}</div></main><SiteFooter /></div>
}
