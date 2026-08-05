import { useEffect, useMemo, useRef, useState } from 'react'
import SiteFooter from './SiteFooter'
import { loadLearningProgress, saveLessonProgress } from '../services/learningProgressStorage'
import { calculateAccuracy, generateRepairDrill } from '../utils/homeRowLesson'
import { buildMiniChallenges, buildMovementExercises, buildWarmups, buildWordPractice, validateLearnedContent } from '../utils/lessonExerciseGenerator'

const PHASES = ['learn', 'warmup', 'movement', 'words', 'challenge', 'recovery', 'review']
const phaseDetails = {
  learn: ['Learn', 'Finger placement, movement, and common mistakes', '2–3 min'],
  warmup: ['Warm-up', 'Build relaxed, accurate repetition', '2–3 min'],
  movement: ['Movement Practice', 'Coordinate movement and return', '4–5 min'],
  words: ['Word Practice', 'Apply learned keys with increasing difficulty', '5 min'],
  challenge: ['Mini Challenge', 'Mix everything you have learned', '2–3 min'],
  recovery: ['Weak Key Recovery', 'Strengthen the key that needs attention', 'As needed'],
  review: ['Lesson Review', 'Review progress and choose what comes next', 'Complete'],
}

function keyScore(key, correctByKey, mistakesByKey) {
  return (correctByKey[key] ?? 0) - (mistakesByKey[key] ?? 0)
}

function GuidedLessonSession({ config, FingerGuide }) {
  const [phase, setPhase] = useState('learn')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [correctCharacters, setCorrectCharacters] = useState(0)
  const [totalCharacters, setTotalCharacters] = useState(0)
  const [mistakesByKey, setMistakesByKey] = useState({})
  const [correctByKey, setCorrectByKey] = useState({})
  const [exerciseMistakes, setExerciseMistakes] = useState(0)
  const [exercisesCompleted, setExercisesCompleted] = useState(0)
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [recoveryKey, setRecoveryKey] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const inputRef = useRef(null)

  const generated = useMemo(() => {
    const warmup = buildWarmups(config.focusKeys)
    const movement = buildMovementExercises(config.movementKeys)
    const words = buildWordPractice(config.wordBank)
    const challenge = buildMiniChallenges(config.wordBank, movement)
    if (!validateLearnedContent([...warmup, ...movement, ...words, ...challenge], config.learnedKeys)) throw new Error(`${config.title} contains an untaught key.`)
    return { warmup, movement, words, challenge }
  }, [config])

  const accuracy = calculateAccuracy(correctCharacters, totalCharacters)
  const weakestKey = [...config.focusKeys].sort((first, second) => keyScore(first, correctByKey, mistakesByKey) - keyScore(second, correctByKey, mistakesByKey))[0]
  const strongestKey = [...config.learnedKeys].filter((key) => key !== ' ').sort((first, second) => keyScore(second, correctByKey, mistakesByKey) - keyScore(first, correctByKey, mistakesByKey))[0] ?? config.focusKeys[0]
  const recoveryExercises = generateRepairDrill(recoveryKey ?? weakestKey)
  const exercises = phase === 'recovery' ? recoveryExercises : generated[phase] ?? []
  const exercise = exercises[exerciseIndex]
  const mismatchPosition = exercise ? Array.from(typed).findIndex((character, index) => character !== exercise[index]) : -1
  const currentKey = exercise?.[mismatchPosition >= 0 ? mismatchPosition : typed.length]
  const progress = exercise ? Math.min(100, Math.round((typed.length / exercise.length) * 100)) : 0
  const mastered = accuracy >= 95 && config.focusKeys.every((key) => (mistakesByKey[key] ?? 0) < 3)

  useEffect(() => { if (exercise) inputRef.current?.focus() }, [exercise, exerciseIndex, phase])

  useEffect(() => {
    if (phase !== 'review') return
    const previous = loadLearningProgress().lessons[config.lessonId] ?? {}
    saveLessonProgress(config.lessonId, {
      ...previous,
      completed: mastered,
      bestAccuracy: Math.max(previous.bestAccuracy ?? 0, accuracy),
      weakKeys: config.focusKeys.filter((key) => (mistakesByKey[key] ?? 0) > 0),
      lastCompletedExercise: exercisesCompleted,
      masteryStatus: mastered ? 'mastered' : 'needs-practice',
      wordsCompleted,
    })
  }, [accuracy, config, exercisesCompleted, mastered, mistakesByKey, phase, wordsCompleted])

  const enterPhase = (nextPhase) => {
    if (nextPhase === 'recovery') setRecoveryKey(weakestKey)
    setPhase(nextPhase); setExerciseIndex(0); setTyped(''); setExerciseMistakes(0); setFeedback('')
    if (nextPhase === 'review') setTimeSpentSeconds(Math.max(1, Math.round((Date.now() - startedAt) / 1000)))
    setAnnouncement(`${phaseDetails[nextPhase][0]} started.`)
  }

  const completeExercise = () => {
    const hadMistakes = exerciseMistakes > 0
    const message = hadMistakes ? 'Let’s reinforce that movement once more.' : '✓ Great!'
    setFeedback(message)
    if (phase === 'recovery' && hadMistakes) {
      setTyped(''); setExerciseMistakes(0); setAnnouncement(`${message} Repeat this recovery exercise.`); return
    }
    const nextCount = exercisesCompleted + 1
    setExercisesCompleted(nextCount)
    if (phase === 'words') setWordsCompleted((count) => count + exercise.split(' ').length)
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((index) => index + 1); setTyped(''); setExerciseMistakes(0); setAnnouncement(`${message} Next exercise.`)
    } else enterPhase(PHASES[PHASES.indexOf(phase) + 1])
  }

  const handleInput = (event) => {
    const nextTyped = event.target.value
    if (nextTyped.length > typed.length) {
      setFeedback('')
      const additions = nextTyped.slice(typed.length); let correct = 0; const newMistakes = {}; const newCorrect = {}
      Array.from(additions).forEach((character, offset) => {
        const expected = exercise[typed.length + offset]
        if (character === expected) { correct += 1; if (expected !== ' ') newCorrect[expected] = (newCorrect[expected] ?? 0) + 1 }
        else if (expected && expected !== ' ') newMistakes[expected] = (newMistakes[expected] ?? 0) + 1
      })
      setCorrectCharacters((count) => count + correct); setTotalCharacters((count) => count + additions.length)
      if (Object.keys(newMistakes).length) {
        setExerciseMistakes((count) => count + Object.values(newMistakes).reduce((sum, count) => sum + count, 0))
        setMistakesByKey((current) => { const next = { ...current }; Object.entries(newMistakes).forEach(([key, count]) => { next[key] = (next[key] ?? 0) + count }); return next })
      }
      if (Object.keys(newCorrect).length) setCorrectByKey((current) => { const next = { ...current }; Object.entries(newCorrect).forEach(([key, count]) => { next[key] = (next[key] ?? 0) + count }); return next })
    }
    setTyped(nextTyped)
    if (nextTyped === exercise) completeExercise()
  }

  const retryLesson = () => {
    setPhase('learn'); setExerciseIndex(0); setTyped(''); setCorrectCharacters(0); setTotalCharacters(0); setMistakesByKey({}); setCorrectByKey({}); setExerciseMistakes(0); setExercisesCompleted(0); setWordsCompleted(0); setFeedback(''); setRecoveryKey(null); setTimeSpentSeconds(0); setStartedAt(Date.now())
  }

  const [phaseTitle, phaseDescription, phaseDuration] = phaseDetails[phase]
  return <div className="app-page learn-page">
    <header className="lesson-header"><div className="content-shell lesson-header-inner"><nav aria-label={`${config.title} navigation`}><a href="/">Back to Practice</a><a href="/learn">Back to Build Muscle Memory</a>{config.previousHref && <a href={config.previousHref}>Previous Lesson</a>}</nav><p className="eyebrow">Lesson {config.lessonNumber}</p><h1>{config.title}</h1><p>{phaseTitle} · Phase {PHASES.indexOf(phase) + 1} of 7</p></div></header>
    <main className="content-shell lesson-main" id="main-content"><p className="sr-only" role="status" aria-live="polite">{announcement}</p><div className={`lesson-phase-progress`} aria-label="Lesson phases">{PHASES.map((item, index) => <span className={index <= PHASES.indexOf(phase) ? 'is-reached' : ''} key={item}>{phaseDetails[item][0]}</span>)}</div><div className={`lesson-stage-layout ${phase === 'learn' || phase === 'review' ? 'is-solo' : ''}`}>
      <section className="lesson-stage-card" aria-labelledby={`${config.lessonId}-phase-heading`}><div className="phase-heading"><div><h2 id={`${config.lessonId}-phase-heading`}>{phaseTitle}</h2><p>{phaseDescription}</p></div><span>{phaseDuration}</span></div>
        {phase === 'learn' && <div className="placement-instructions"><p className="lesson-introduction">{config.introduction}</p><div className="learning-notes"><section><h3>Finger placement</h3><p>{config.placement}</p></section><section><h3>Finger movement</h3><p>{config.movement}</p></section><section><h3>Home position</h3><p>{config.homePosition}</p></section><section><h3>Common mistakes</h3><p>{config.commonMistakes}</p></section></div></div>}
        {exercise && <div className="guided-exercise">{feedback && <p className="exercise-feedback" role="status">{feedback}</p>}<p className="exercise-count">Exercise {exerciseIndex + 1} of {exercises.length}</p><div className="exercise-target" aria-label={`Type: ${exercise}`}>{exercise}</div><dl className="exercise-live-feedback" aria-label="Live exercise feedback"><div><dt>Current key</dt><dd>{currentKey === ' ' ? 'Space' : currentKey?.toUpperCase() ?? 'Complete'}</dd></div><div><dt>Accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div><div><dt>Progress</dt><dd>{progress}%</dd></div></dl><p className="finger-instruction">{config.fingerInstructions[currentKey] ?? config.returnInstruction}</p><label htmlFor={`${config.lessonId}-input`}>Type the exercise</label><input id={`${config.lessonId}-input`} ref={inputRef} value={typed} maxLength={exercise.length} onChange={handleInput} onPaste={(event) => { event.preventDefault(); setAnnouncement('Paste is disabled for guided learning.') }} autoComplete="off" autoCapitalize="off" spellCheck="false" /><p className="lesson-input-help">Use Backspace to correct a key. There is no timer.</p></div>}
        {phase === 'review' && <div className="lesson-result"><dl><div><dt>Time spent</dt><dd>{timeSpentSeconds} seconds</dd></div><div><dt>Accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div><div><dt>Strongest key</dt><dd>{strongestKey.toUpperCase()}</dd></div><div><dt>Weakest key</dt><dd>{weakestKey.toUpperCase()}</dd></div><div><dt>Exercises completed</dt><dd>{exercisesCompleted}</dd></div><div><dt>Words completed</dt><dd>{wordsCompleted}</dd></div></dl><div className="lesson-recommendation"><strong>Recommendation</strong><p>{mastered ? 'Continue when you can maintain the same relaxed accuracy.' : `Retry focused practice for ${weakestKey.toUpperCase()} before continuing.`}</p></div></div>}
        <div className="lesson-actions">{phase === 'learn' && <button className="button button-primary" type="button" onClick={() => enterPhase('warmup')}>Begin Warm-up</button>}{phase === 'review' && <><a className="button button-primary" href="/learn">Continue</a><button className="button button-secondary" type="button" onClick={retryLesson}>Retry</button></>}{exercise && <button className="button button-secondary" type="button" onClick={() => { setTyped(''); setExerciseMistakes(0); inputRef.current?.focus() }}>Retry Exercise</button>}</div>
      </section>{phase !== 'learn' && phase !== 'review' && <FingerGuide />}
    </div></main><SiteFooter />
  </div>
}

export default GuidedLessonSession
