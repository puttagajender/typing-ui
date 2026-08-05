import { useEffect, useRef, useState } from 'react'
import BottomRowFingerGuide from './BottomRowFingerGuide'
import SiteFooter from './SiteFooter'
import { loadLearningProgress, saveLessonProgress } from '../services/learningProgressStorage'
import { calculateAccuracy, generateRepairDrill } from '../utils/homeRowLesson'
import { BOTTOM_ROW_EXERCISE_GROUPS, BOTTOM_ROW_EXERCISES, evaluateBottomRowMastery, REQUIRED_BOTTOM_ROW_GUIDED_EXERCISES } from '../utils/bottomRowLesson'

const fingerByKey = {
  a: 'Press A with your left pinky.', s: 'Press S with your left ring finger.', d: 'Return your left middle finger to D.', f: 'Press F with your left index finger.',
  j: 'Return your right index finger to J.', k: 'Press K with your right middle finger.', l: 'Press L with your right ring finger.', ';': 'Press ; with your right pinky.',
  e: 'Press E with your left middle finger.', i: 'Press I with your right middle finger.', c: 'Press C with your left middle finger.', n: 'Press N with your right index finger.', ' ': 'Press Space with either thumb.',
}

const groupForExercise = (index) => {
  let offset = 0
  for (const group of BOTTOM_ROW_EXERCISE_GROUPS) {
    if (index < offset + group.exercises.length) return { ...group, number: index - offset + 1 }
    offset += group.exercises.length
  }
  return BOTTOM_ROW_EXERCISE_GROUPS.at(-1)
}

function BottomRowLesson() {
  const [stage, setStage] = useState('understand')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [correctCharacters, setCorrectCharacters] = useState(0)
  const [totalCharacters, setTotalCharacters] = useState(0)
  const [mistakesByKey, setMistakesByKey] = useState({})
  const [correctByKey, setCorrectByKey] = useState({})
  const [exerciseMistakes, setExerciseMistakes] = useState(0)
  const [completedExercises, setCompletedExercises] = useState(0)
  const [guidedExercisesCompleted, setGuidedExercisesCompleted] = useState(0)
  const [wordExercisesCompleted, setWordExercisesCompleted] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0)
  const [lessonStartedAt, setLessonStartedAt] = useState(() => Date.now())
  const inputRef = useRef(null)
  const exercise = BOTTOM_ROW_EXERCISES[exerciseIndex]
  const group = groupForExercise(exerciseIndex)
  const accuracy = calculateAccuracy(correctCharacters, totalCharacters)
  const mastery = evaluateBottomRowMastery({ accuracy, guidedExercisesCompleted, wordExercisesCompleted, mistakesByKey })
  const weakestKey = (mistakesByKey.c ?? 0) >= (mistakesByKey.n ?? 0) ? 'c' : 'n'
  const mostImprovedKey = ((correctByKey.c ?? 0) - (mistakesByKey.c ?? 0)) >= ((correctByKey.n ?? 0) - (mistakesByKey.n ?? 0)) ? 'C' : 'N'
  const mismatchPosition = Array.from(typed).findIndex((character, index) => character !== exercise?.[index])
  const currentKey = exercise?.[mismatchPosition >= 0 ? mismatchPosition : typed.length]
  const progress = exercise ? Math.min(100, Math.round((typed.length / exercise.length) * 100)) : 0
  const repairDrill = generateRepairDrill(weakestKey)

  useEffect(() => { if (stage === 'practice') inputRef.current?.focus() }, [exerciseIndex, stage])

  useEffect(() => {
    if (!completedExercises || stage === 'result') return
    const stored = loadLearningProgress().lessons['bottom-row-c-n'] ?? {}
    saveLessonProgress('bottom-row-c-n', { ...stored, lastCompletedExercise: completedExercises, masteryStatus: 'in-progress' })
  }, [completedExercises, stage])

  useEffect(() => {
    if (stage !== 'result') return
    saveLessonProgress('bottom-row-c-n', {
      completed: mastery.passed,
      bestAccuracy: Math.max(loadLearningProgress().lessons['bottom-row-c-n']?.bestAccuracy ?? 0, accuracy),
      weakKeys: mastery.weakKeys,
      lastCompletedExercise: completedExercises,
      masteryStatus: mastery.passed ? 'mastered' : 'needs-practice',
    })
  }, [accuracy, completedExercises, mastery.passed, mastery.weakKeys, stage])

  const beginStage = (nextStage) => { setStage(nextStage); setAnnouncement(`${nextStage === 'observe' ? 'Finger movement guide' : 'Practice'} started.`) }

  const completeExercise = () => {
    const nextCompleted = completedExercises + 1
    const nextFeedback = exerciseMistakes === 0 ? '✓ Great!' : 'Let’s strengthen that movement in the next exercise.'
    setCompletedExercises(nextCompleted); setFeedback(nextFeedback)
    if (exerciseIndex < REQUIRED_BOTTOM_ROW_GUIDED_EXERCISES) setGuidedExercisesCompleted((count) => count + 1)
    else setWordExercisesCompleted((count) => count + 1)
    if (exerciseIndex < BOTTOM_ROW_EXERCISES.length - 1) {
      setExerciseIndex((index) => index + 1); setTyped(''); setExerciseMistakes(0); setAnnouncement(`${nextFeedback} Exercise ${nextCompleted} complete. Next exercise.`)
    } else {
      setTimeSpentSeconds(Math.max(1, Math.round((Date.now() - lessonStartedAt) / 1000))); setStage('result'); setAnnouncement('Lesson 3 complete.')
    }
  }

  const handleInput = (event) => {
    const nextTyped = event.target.value
    if (nextTyped.length > typed.length) {
      setFeedback('')
      const additions = nextTyped.slice(typed.length)
      let correct = 0
      const newMistakes = {}; const newCorrect = {}
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

  const retryExercise = () => { setTyped(''); setExerciseMistakes(0); setFeedback(''); setAnnouncement('Exercise reset. Focus on the downward movement.'); inputRef.current?.focus() }
  const retryLesson = () => { setStage('understand'); setExerciseIndex(0); setTyped(''); setCorrectCharacters(0); setTotalCharacters(0); setMistakesByKey({}); setCorrectByKey({}); setExerciseMistakes(0); setCompletedExercises(0); setGuidedExercisesCompleted(0); setWordExercisesCompleted(0); setFeedback(''); setTimeSpentSeconds(0); setLessonStartedAt(Date.now()) }

  return <div className="app-page learn-page">
    <header className="lesson-header"><div className="content-shell lesson-header-inner"><nav aria-label="Lesson 3 navigation"><a href="/">Back to Practice</a><a href="/learn">Back to Build Muscle Memory</a><a href="/learn/top-row-e-i">Previous Lesson</a></nav><p className="eyebrow">Lesson 3</p><h1>Bottom Row Introduction — C and N</h1><p>Move down from the home row, press accurately, and return.</p></div></header>
    <main className="content-shell lesson-main" id="main-content"><p className="sr-only" role="status" aria-live="polite">{announcement}</p><div className={`lesson-stage-layout ${stage === 'understand' || stage === 'result' ? 'is-solo' : ''}`}>
      <section className="lesson-stage-card" aria-labelledby="lesson-three-stage-heading"><h2 id="lesson-three-stage-heading">{stage === 'understand' ? 'Understand' : stage === 'observe' ? 'Observe' : stage === 'result' ? 'Lesson 3 Complete' : group.label}</h2>
        {stage === 'understand' && <div className="placement-instructions"><p className="lesson-introduction">Your left middle finger moves down from D to C. Your right index finger moves down from J to N. After pressing C or N, return to D or J. Keep your other fingers resting on the home row, keep your hands relaxed, and choose accuracy before speed.</p><ul className="lesson-objectives"><li>Move from D to C with the left middle finger</li><li>Move from J to N with the right index finger</li><li>Return both fingers without moving the rest of the hand</li></ul></div>}
        {stage === 'observe' && <div className="placement-instructions"><p>Observe both downward paths. C belongs to the left middle finger; N belongs to the right index finger. D and J remain their home positions.</p></div>}
        {stage === 'practice' && <div className="guided-exercise">{feedback && <p className="exercise-feedback" role="status">{feedback}</p>}<p className="exercise-count">{group.label} · Exercise {group.number} of {group.exercises.length}</p><div className="exercise-target" aria-label={`Type: ${exercise}`}>{exercise}</div><dl className="exercise-live-feedback" aria-label="Live exercise feedback"><div><dt>Current target key</dt><dd>{currentKey === ' ' ? 'Space' : currentKey?.toUpperCase() ?? 'Complete'}</dd></div><div><dt>Current accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div><div><dt>Exercise progress</dt><dd>{progress}%</dd></div></dl><p className="finger-instruction" aria-live="polite">{fingerByKey[currentKey] ?? 'Return your fingers to D and J.'}</p><label htmlFor="lesson-three-input">Type the exercise</label><input id="lesson-three-input" ref={inputRef} value={typed} maxLength={exercise.length} onChange={handleInput} onPaste={(event) => { event.preventDefault(); setAnnouncement('Paste is disabled for guided practice.') }} autoComplete="off" autoCapitalize="off" spellCheck="false" /><p className="lesson-input-help">Use Backspace to correct a key. Speed is not measured.</p></div>}
        {stage === 'result' && <div className="lesson-result"><dl><div><dt>Accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div><div><dt>Most improved key</dt><dd>{mostImprovedKey}</dd></div><div><dt>Weakest key</dt><dd>{mastery.weakKeys[0]?.toUpperCase() ?? 'None'}</dd></div><div><dt>Time spent</dt><dd>{timeSpentSeconds} seconds</dd></div><div><dt>Exercises completed</dt><dd>{completedExercises}</dd></div></dl>{!mastery.passed && <div className="repair-drill"><h3>Let’s strengthen C and N before continuing.</h3><p>Repair drill for {weakestKey.toUpperCase()}</p><ol>{repairDrill.map((item) => <li key={item}>{item}</li>)}</ol></div>}<div className="next-lesson-placeholder"><div><strong>Next lesson</strong><span>Top Row Movement — R and U</span></div><span>Coming Soon</span></div></div>}
        <div className="lesson-actions">{stage === 'understand' && <button className="button button-primary" type="button" onClick={() => beginStage('observe')}>Continue to Finger Guide</button>}{stage === 'observe' && <button className="button button-primary" type="button" onClick={() => beginStage('practice')}>Start Practice</button>}{stage === 'practice' && <button className="button button-secondary" type="button" onClick={retryExercise}>Retry</button>}<button className="button button-tertiary" type="button" onClick={retryLesson}>Retry Lesson</button></div>
      </section>{(stage === 'observe' || stage === 'practice') && <BottomRowFingerGuide />}
    </div></main><SiteFooter />
  </div>
}

export default BottomRowLesson
