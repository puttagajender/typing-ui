import { useEffect, useRef, useState } from 'react'
import SiteFooter from './SiteFooter'
import TopRowFingerGuide from './TopRowFingerGuide'
import { loadLearningProgress, saveLessonProgress } from '../services/learningProgressStorage'
import { calculateAccuracy, generateRepairDrill } from '../utils/homeRowLesson'
import { evaluateTopRowMastery, REQUIRED_GUIDED_EXERCISES, TOP_ROW_EXERCISE_GROUPS, TOP_ROW_EXERCISES } from '../utils/topRowLesson'

const fingerByKey = {
  a: 'Press A with your left pinky.', s: 'Press S with your left ring finger.', d: 'Return your left middle finger to D.', f: 'Press F with your left index finger.',
  j: 'Press J with your right index finger.', k: 'Return your right middle finger to K.', l: 'Press L with your right ring finger.', ';': 'Press ; with your right pinky.',
  e: 'Press E with your left middle finger.', i: 'Press I with your right middle finger.', ' ': 'Press Space with either thumb.',
}

const groupForExercise = (index) => {
  let offset = 0
  for (const group of TOP_ROW_EXERCISE_GROUPS) {
    if (index < offset + group.exercises.length) return { ...group, number: index - offset + 1, offset }
    offset += group.exercises.length
  }
  return TOP_ROW_EXERCISE_GROUPS.at(-1)
}

function TopRowLesson() {
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
  const exercise = TOP_ROW_EXERCISES[exerciseIndex]
  const group = groupForExercise(exerciseIndex)
  const accuracy = calculateAccuracy(correctCharacters, totalCharacters)
  const mastery = evaluateTopRowMastery({ accuracy, guidedExercisesCompleted, wordExercisesCompleted, mistakesByKey })
  const weakestKey = (mistakesByKey.e ?? 0) >= (mistakesByKey.i ?? 0) ? 'e' : 'i'
  const mostImprovedKey = ((correctByKey.e ?? 0) - (mistakesByKey.e ?? 0)) >= ((correctByKey.i ?? 0) - (mistakesByKey.i ?? 0)) ? 'E' : 'I'
  const mismatchPosition = Array.from(typed).findIndex((character, index) => character !== exercise?.[index])
  const currentKey = exercise?.[mismatchPosition >= 0 ? mismatchPosition : typed.length]
  const progress = exercise ? Math.min(100, Math.round((typed.length / exercise.length) * 100)) : 0
  const repairDrill = generateRepairDrill(weakestKey)

  useEffect(() => {
    if (stage === 'practice') inputRef.current?.focus()
  }, [exerciseIndex, stage])

  useEffect(() => {
    if (!completedExercises || stage === 'result') return
    const stored = loadLearningProgress().lessons['top-row-e-i'] ?? {}
    saveLessonProgress('top-row-e-i', { ...stored, lastCompletedExercise: completedExercises, masteryStatus: 'in-progress' })
  }, [completedExercises, stage])

  useEffect(() => {
    if (stage !== 'result') return
    saveLessonProgress('top-row-e-i', {
      completed: mastery.passed,
      bestAccuracy: Math.max(loadLearningProgress().lessons['top-row-e-i']?.bestAccuracy ?? 0, accuracy),
      weakKeys: mastery.weakKeys,
      lastCompletedExercise: completedExercises,
      masteryStatus: mastery.passed ? 'mastered' : 'needs-practice',
    })
  }, [accuracy, completedExercises, mastery.passed, mastery.weakKeys, stage])

  const beginStage = (nextStage) => {
    setStage(nextStage)
    setAnnouncement(`${nextStage === 'observe' ? 'Finger movement guide' : 'Practice'} started.`)
  }

  const completeExercise = () => {
    const nextCompleted = completedExercises + 1
    const nextFeedback = exerciseMistakes === 0 ? '✓ Great!' : 'Let’s strengthen that movement in the next exercise.'
    setCompletedExercises(nextCompleted)
    setFeedback(nextFeedback)
    if (exerciseIndex < REQUIRED_GUIDED_EXERCISES) setGuidedExercisesCompleted((count) => count + 1)
    else setWordExercisesCompleted((count) => count + 1)

    if (exerciseIndex < TOP_ROW_EXERCISES.length - 1) {
      setExerciseIndex((index) => index + 1)
      setTyped('')
      setExerciseMistakes(0)
      setAnnouncement(`${nextFeedback} Exercise ${nextCompleted} complete. Next exercise.`)
    } else {
      setTimeSpentSeconds(Math.max(1, Math.round((Date.now() - lessonStartedAt) / 1000)))
      setStage('result')
      setAnnouncement('Lesson 2 complete.')
    }
  }

  const handleInput = (event) => {
    const nextTyped = event.target.value
    if (nextTyped.length > typed.length) {
      setFeedback('')
      const additions = nextTyped.slice(typed.length)
      let correct = 0
      const newMistakes = {}
      const newCorrect = {}
      Array.from(additions).forEach((character, offset) => {
        const expected = exercise[typed.length + offset]
        if (character === expected) {
          correct += 1
          if (expected !== ' ') newCorrect[expected] = (newCorrect[expected] ?? 0) + 1
        } else if (expected && expected !== ' ') newMistakes[expected] = (newMistakes[expected] ?? 0) + 1
      })
      setCorrectCharacters((count) => count + correct)
      setTotalCharacters((count) => count + additions.length)
      if (Object.keys(newMistakes).length) {
        setExerciseMistakes((count) => count + Object.values(newMistakes).reduce((sum, count) => sum + count, 0))
        setMistakesByKey((current) => {
          const next = { ...current }
          Object.entries(newMistakes).forEach(([key, count]) => { next[key] = (next[key] ?? 0) + count })
          return next
        })
      }
      if (Object.keys(newCorrect).length) {
        setCorrectByKey((current) => {
          const next = { ...current }
          Object.entries(newCorrect).forEach(([key, count]) => { next[key] = (next[key] ?? 0) + count })
          return next
        })
      }
    }
    setTyped(nextTyped)
    if (nextTyped === exercise) completeExercise()
  }

  const retryExercise = () => {
    setTyped('')
    setExerciseMistakes(0)
    setFeedback('')
    setAnnouncement('Exercise reset. Focus on the middle-finger movement.')
    inputRef.current?.focus()
  }

  const retryLesson = () => {
    setStage('understand'); setExerciseIndex(0); setTyped(''); setCorrectCharacters(0); setTotalCharacters(0); setMistakesByKey({}); setCorrectByKey({}); setExerciseMistakes(0); setCompletedExercises(0); setGuidedExercisesCompleted(0); setWordExercisesCompleted(0); setFeedback(''); setTimeSpentSeconds(0); setLessonStartedAt(Date.now())
  }

  return (
    <div className="app-page learn-page">
      <header className="lesson-header">
        <div className="content-shell lesson-header-inner">
          <nav aria-label="Lesson 2 navigation"><a href="/">Back to Practice</a><a href="/learn">Back to Build Muscle Memory</a><a href="/learn/home-row">Previous Lesson</a></nav>
          <p className="eyebrow">Lesson 2</p>
          <h1>Top Row Introduction — E and I</h1>
          <p>Move from the home row, press accurately, and return.</p>
        </div>
      </header>
      <main className="content-shell lesson-main" id="main-content">
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
        <div className={`lesson-stage-layout ${stage === 'understand' || stage === 'result' ? 'is-solo' : ''}`}>
          <section className="lesson-stage-card" aria-labelledby="lesson-two-stage-heading">
            <h2 id="lesson-two-stage-heading">{stage === 'understand' ? 'Understand' : stage === 'observe' ? 'Observe' : stage === 'result' ? 'Lesson 2 Complete' : group.label}</h2>
            {stage === 'understand' && <div className="placement-instructions"><p className="lesson-introduction">Your left middle finger moves from D to E. Your right middle finger moves from K to I. After pressing E or I, return the finger to D or K. Move gently and choose accuracy before speed.</p><ul className="lesson-objectives"><li>Move from D to E with the left middle finger</li><li>Move from K to I with the right middle finger</li><li>Return both fingers to their home keys</li></ul></div>}
            {stage === 'observe' && <div className="placement-instructions"><p>Observe the two middle-finger paths. E belongs to the left middle finger; I belongs to the right middle finger. D and K remain their permanent home positions.</p></div>}
            {stage === 'practice' && <div className="guided-exercise">
              {feedback && <p className="exercise-feedback" role="status">{feedback}</p>}
              <p className="exercise-count">{group.label} · Exercise {group.number} of {group.exercises.length}</p>
              <div className="exercise-target" aria-label={`Type: ${exercise}`}>{exercise}</div>
              <dl className="exercise-live-feedback" aria-label="Live exercise feedback"><div><dt>Current key</dt><dd>{currentKey === ' ' ? 'Space' : currentKey?.toUpperCase() ?? 'Complete'}</dd></div><div><dt>Current accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div><div><dt>Exercise progress</dt><dd>{progress}%</dd></div></dl>
              <p className="finger-instruction" aria-live="polite">{fingerByKey[currentKey] ?? 'Return your fingers to D and K.'}</p>
              <label htmlFor="lesson-two-input">Type the exercise</label>
              <input id="lesson-two-input" ref={inputRef} value={typed} maxLength={exercise.length} onChange={handleInput} onPaste={(event) => { event.preventDefault(); setAnnouncement('Paste is disabled for guided practice.') }} autoComplete="off" autoCapitalize="off" spellCheck="false" />
              <p className="lesson-input-help">Use Backspace to correct a key. Speed is not measured.</p>
            </div>}
            {stage === 'result' && <div className="lesson-result"><dl><div><dt>Accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div><div><dt>Most improved key</dt><dd>{mostImprovedKey}</dd></div><div><dt>Weakest key</dt><dd>{mastery.weakKeys[0]?.toUpperCase() ?? 'None'}</dd></div><div><dt>Time spent</dt><dd>{timeSpentSeconds} seconds</dd></div><div><dt>Exercises completed</dt><dd>{completedExercises}</dd></div></dl>{!mastery.passed && <div className="repair-drill"><h3>Let’s strengthen E and I before continuing.</h3><p>Repair drill for {weakestKey.toUpperCase()}</p><ol>{repairDrill.map((item) => <li key={item}>{item}</li>)}</ol></div>}<div className="next-lesson-placeholder"><div><strong>Next lesson</strong><span>Bottom Row Introduction — C and N</span></div><span>Coming Soon</span></div></div>}
            <div className="lesson-actions">{stage === 'understand' && <button className="button button-primary" type="button" onClick={() => beginStage('observe')}>Continue to Finger Guide</button>}{stage === 'observe' && <button className="button button-primary" type="button" onClick={() => beginStage('practice')}>Start Practice</button>}{stage === 'practice' && <button className="button button-secondary" type="button" onClick={retryExercise}>Retry</button>}<button className="button button-tertiary" type="button" onClick={retryLesson}>Retry Lesson</button></div>
          </section>
          {(stage === 'observe' || stage === 'practice') && <TopRowFingerGuide />}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default TopRowLesson
