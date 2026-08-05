import { useEffect, useRef, useState } from 'react'
import FingerGuide from './FingerGuide'
import SiteFooter from './SiteFooter'
import { loadLearningProgress, saveLearningProgress } from '../services/learningProgressStorage'
import { calculateAccuracy, evaluateHomeRowMastery, generateRepairDrill, GUIDED_EXERCISES, HOME_ROW_EXERCISES, WORD_EXERCISES } from '../utils/homeRowLesson'

const stages = ['understand', 'observe', 'guided', 'home-row', 'words', 'result']
const stageLabels = { understand: 'Understand', observe: 'Observe', guided: 'Practice', 'home-row': 'Improve', words: 'Master', result: 'Lesson Complete' }
const exercisesByStage = { guided: GUIDED_EXERCISES, 'home-row': HOME_ROW_EXERCISES, words: WORD_EXERCISES }

function HomeRowLesson() {
  const [stage, setStage] = useState('understand')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [correctCharacters, setCorrectCharacters] = useState(0)
  const [totalCharacters, setTotalCharacters] = useState(0)
  const [guidedExercisesCompleted, setGuidedExercisesCompleted] = useState(0)
  const [mistakesByKey, setMistakesByKey] = useState({})
  const [correctByKey, setCorrectByKey] = useState({})
  const [exerciseMistakes, setExerciseMistakes] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const [lessonStartedAt] = useState(() => Date.now())
  const inputRef = useRef(null)
  const exercises = exercisesByStage[stage] ?? []
  const exercise = exercises[exerciseIndex]
  const accuracy = calculateAccuracy(correctCharacters, totalCharacters)
  const mastery = evaluateHomeRowMastery({ accuracy, guidedExercisesCompleted, mistakesByKey })
  const difficultKey = Object.entries(mistakesByKey).sort((first, second) => second[1] - first[1])[0]?.[0] ?? 'None'
  const mostImprovedKey = Object.entries(correctByKey)
    .sort((first, second) => (second[1] - (mistakesByKey[second[0]] ?? 0)) - (first[1] - (mistakesByKey[first[0]] ?? 0)))[0]?.[0] ?? 'F'
  const repairDrill = mastery.passed ? [] : generateRepairDrill(difficultKey === 'None' ? 'f' : difficultKey)
  const mismatchPosition = exercise ? Array.from(typed).findIndex((character, index) => character !== exercise[index]) : -1
  const currentKey = exercise?.[mismatchPosition >= 0 ? mismatchPosition : typed.length]
  const exerciseProgress = exercise ? Math.min(100, Math.round((typed.length / exercise.length) * 100)) : 0

  useEffect(() => {
    const current = loadLearningProgress()
    saveLearningProgress({ ...current, currentLesson: 'home-row', lastAttemptedStage: stage })
  }, [stage])

  useEffect(() => {
    if (exercise) inputRef.current?.focus()
  }, [exercise, exerciseIndex, stage])

  const moveToStage = (nextStage) => {
    if (nextStage === 'result') setTimeSpentSeconds(Math.max(1, Math.round((Date.now() - lessonStartedAt) / 1000)))
    setStage(nextStage)
    setExerciseIndex(0)
    setTyped('')
    setExerciseMistakes(0)
    setAnnouncement(`${stageLabels[nextStage]} started.`)
  }

  const completeExercise = () => {
    const nextFeedback = exerciseMistakes === 0 ? '✓ Great!' : 'Let’s improve one key before continuing.'
    setFeedback(nextFeedback)
    if (stage === 'guided') setGuidedExercisesCompleted((count) => count + 1)
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((index) => index + 1)
      setTyped('')
      setExerciseMistakes(0)
      setAnnouncement(`${nextFeedback} Exercise ${exerciseIndex + 1} completed. Next exercise.`)
    } else {
      moveToStage(stages[stages.indexOf(stage) + 1])
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
        } else if (expected && expected !== ' ') {
          newMistakes[expected] = (newMistakes[expected] ?? 0) + 1
        }
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

  const previousStage = () => moveToStage(stages[Math.max(0, stages.indexOf(stage) - 1)])

  const retry = () => {
    setTyped('')
    setExerciseMistakes(0)
    setFeedback('')
    setAnnouncement('Exercise reset. Try again with accuracy first.')
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (stage !== 'result') return
    const current = loadLearningProgress()
    const completedLessonIds = mastery.passed ? [...new Set([...current.completedLessonIds, 'home-row'])] : current.completedLessonIds
    saveLearningProgress({ ...current, currentLesson: 'home-row', completedLessonIds, bestLessonAccuracy: Math.max(current.bestLessonAccuracy, accuracy), weakKeys: mastery.weakKeys, lastAttemptedStage: 'result' })
  }, [accuracy, mastery.passed, mastery.weakKeys, stage])

  return (
    <div className="app-page learn-page">
      <header className="lesson-header">
        <div className="content-shell lesson-header-inner">
          <nav aria-label="Learning navigation"><a href="/">Back to Practice</a><a href="/learn">Build Muscle Memory home</a></nav>
          <p className="eyebrow">Lesson 1 of 1</p>
          <h1>Home Row Foundation</h1>
          <p>{stageLabels[stage]} · Step {stages.indexOf(stage) + 1} of {stages.length}</p>
        </div>
      </header>
      <main className="content-shell lesson-main" id="main-content">
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
        <div className={`lesson-stage-layout ${stage === 'understand' || stage === 'result' ? 'is-solo' : ''}`}>
          <section className="lesson-stage-card" aria-labelledby="stage-heading">
            <h2 id="stage-heading">{stageLabels[stage]}</h2>
            {stage === 'understand' && (
              <div className="placement-instructions">
                <p className="lesson-introduction">Every finger has a permanent home. When you finish pressing a key, always return your finger to its home position. This habit is called touch typing.</p>
                <p>First, understand the habit. Next, observe where every finger rests. Typing begins only after you are ready.</p>
              </div>
            )}
            {stage === 'observe' && (
              <div className="placement-instructions">
                <div className="hand-summary"><p><strong>Left hand:</strong> A S D F</p><p><strong>Right hand:</strong> J K L ;</p><p><strong>Thumbs:</strong> Space</p></div>
                <ul>
                  <li>Left pinky rests on A</li><li>Left ring finger rests on S</li><li>Left middle finger rests on D</li><li>Left index finger rests on F</li>
                  <li>Right index finger rests on J</li><li>Right middle finger rests on K</li><li>Right ring finger rests on L</li><li>Right pinky rests on ;</li>
                </ul>
                <p>F and J usually have raised bumps. They help you find the home row without looking at the keyboard.</p>
                <p>Keep your fingers relaxed and return each finger to its home-row key. Accuracy matters more than speed.</p>
              </div>
            )}
            {exercise && (
              <div className="guided-exercise">
                {feedback && <p className="exercise-feedback" role="status">{feedback}</p>}
                <p className="exercise-count">Exercise {exerciseIndex + 1} of {exercises.length}</p>
                <div className="exercise-target" aria-label={`Type: ${exercise}`}>{exercise}</div>
                <dl className="exercise-live-feedback" aria-label="Live exercise feedback">
                  <div><dt>Current key</dt><dd>{currentKey === ' ' ? 'Space' : currentKey?.toUpperCase() ?? 'Complete'}</dd></div>
                  <div><dt>Current accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div>
                  <div><dt>Current progress</dt><dd>{exerciseProgress}%</dd></div>
                </dl>
                <label htmlFor="lesson-input">Type the exercise</label>
                <input id="lesson-input" ref={inputRef} value={typed} maxLength={exercise.length} onChange={handleInput} onPaste={(event) => { event.preventDefault(); setAnnouncement('Paste is disabled for guided practice.') }} autoComplete="off" autoCapitalize="off" spellCheck="false" />
                <p className="lesson-input-help">Backspace is available. Take your time and aim for accuracy.</p>
              </div>
            )}
            {stage === 'result' && (
              <div className="lesson-result">
                <dl><div><dt>Accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div><div><dt>Most improved key</dt><dd>{mostImprovedKey.toUpperCase()}</dd></div><div><dt>Weakest key</dt><dd>{difficultKey === 'None' ? 'None' : difficultKey.toUpperCase()}</dd></div><div><dt>Time spent</dt><dd>{timeSpentSeconds} seconds</dd></div></dl>
                {!mastery.passed && <div className="repair-drill"><h3>Let’s strengthen a few keys before continuing.</h3><p>Short repair drill for {difficultKey === 'None' ? 'F' : difficultKey.toUpperCase()}</p><ol>{repairDrill.map((item) => <li key={item}>{item}</li>)}</ol></div>}
                <div className="next-lesson-placeholder"><strong>Next lesson</strong><span>Coming Soon</span></div>
              </div>
            )}
            <div className="lesson-actions">
              {stage !== 'understand' && <button className="button button-secondary" type="button" onClick={previousStage}>Previous</button>}
              {exercise && <button className="button button-secondary" type="button" onClick={retry}>Retry</button>}
              {stage === 'understand' && <button className="button button-primary" type="button" onClick={() => moveToStage('observe')}>Continue to Finger Guide</button>}
              {stage === 'observe' && <button className="button button-primary" type="button" onClick={() => moveToStage('guided')}>Start Practice</button>}
              {stage === 'result' && <a className="button button-primary" href="/learn">Continue Lesson</a>}
            </div>
          </section>
          {stage !== 'understand' && stage !== 'result' && <FingerGuide />}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default HomeRowLesson
