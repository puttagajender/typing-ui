import { useEffect, useRef, useState } from 'react'
import FingerGuide from './FingerGuide'
import SiteFooter from './SiteFooter'
import { loadLearningProgress, saveLearningProgress } from '../services/learningProgressStorage'
import { calculateAccuracy, evaluateHomeRowMastery, generateRepairDrill, GUIDED_EXERCISES, HOME_ROW_EXERCISES, WORD_EXERCISES } from '../utils/homeRowLesson'

const stages = ['learn', 'guided', 'home-row', 'words', 'result']
const stageLabels = { learn: 'Learn', guided: 'Guided Key Practice', 'home-row': 'Home Row Practice', words: 'Short Words', result: 'Result' }
const exercisesByStage = { guided: GUIDED_EXERCISES, 'home-row': HOME_ROW_EXERCISES, words: WORD_EXERCISES }

function HomeRowLesson() {
  const [stage, setStage] = useState('learn')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [correctCharacters, setCorrectCharacters] = useState(0)
  const [totalCharacters, setTotalCharacters] = useState(0)
  const [guidedExercisesCompleted, setGuidedExercisesCompleted] = useState(0)
  const [mistakesByKey, setMistakesByKey] = useState({})
  const [announcement, setAnnouncement] = useState('')
  const inputRef = useRef(null)
  const exercises = exercisesByStage[stage] ?? []
  const exercise = exercises[exerciseIndex]
  const accuracy = calculateAccuracy(correctCharacters, totalCharacters)
  const mastery = evaluateHomeRowMastery({ accuracy, guidedExercisesCompleted, mistakesByKey })
  const difficultKey = Object.entries(mistakesByKey).sort((first, second) => second[1] - first[1])[0]?.[0] ?? 'None'
  const repairDrill = mastery.passed ? [] : generateRepairDrill(difficultKey === 'None' ? 'f' : difficultKey)

  useEffect(() => {
    const current = loadLearningProgress()
    saveLearningProgress({ ...current, currentLesson: 'home-row', lastAttemptedStage: stage })
  }, [stage])

  useEffect(() => {
    if (exercise) inputRef.current?.focus()
  }, [exercise, exerciseIndex, stage])

  const moveToStage = (nextStage) => {
    setStage(nextStage)
    setExerciseIndex(0)
    setTyped('')
    setAnnouncement(`${stageLabels[nextStage]} started.`)
  }

  const completeExercise = () => {
    if (stage === 'guided') setGuidedExercisesCompleted((count) => count + 1)
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((index) => index + 1)
      setTyped('')
      setAnnouncement(`Exercise ${exerciseIndex + 1} complete. Next exercise.`)
    } else {
      moveToStage(stages[stages.indexOf(stage) + 1])
    }
  }

  const handleInput = (event) => {
    const nextTyped = event.target.value
    if (nextTyped.length > typed.length) {
      const additions = nextTyped.slice(typed.length)
      let correct = 0
      const newMistakes = {}
      Array.from(additions).forEach((character, offset) => {
        const expected = exercise[typed.length + offset]
        if (character === expected) correct += 1
        else if (expected && expected !== ' ') newMistakes[expected] = (newMistakes[expected] ?? 0) + 1
      })
      setCorrectCharacters((count) => count + correct)
      setTotalCharacters((count) => count + additions.length)
      if (Object.keys(newMistakes).length) {
        setMistakesByKey((current) => {
          const next = { ...current }
          Object.entries(newMistakes).forEach(([key, count]) => { next[key] = (next[key] ?? 0) + count })
          return next
        })
      }
    }
    setTyped(nextTyped)
    if (nextTyped === exercise) completeExercise()
  }

  const previousStage = () => {
    const previous = stages[Math.max(0, stages.indexOf(stage) - 1)]
    moveToStage(previous)
  }

  const retry = () => {
    setTyped('')
    setAnnouncement('Exercise reset. Try again with accuracy first.')
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (stage !== 'result') return
    const current = loadLearningProgress()
    const completedLessonIds = mastery.passed ? [...new Set([...current.completedLessonIds, 'home-row'])] : current.completedLessonIds
    saveLearningProgress({
      ...current,
      currentLesson: 'home-row',
      completedLessonIds,
      bestLessonAccuracy: Math.max(current.bestLessonAccuracy, accuracy),
      weakKeys: mastery.weakKeys,
      lastAttemptedStage: 'result',
    })
  }, [accuracy, mastery.passed, mastery.weakKeys, stage])

  return (
    <div className="app-page learn-page">
      <header className="lesson-header">
        <div className="content-shell lesson-header-inner">
          <nav aria-label="Learning navigation"><a href="/">Back to Practice</a><a href="/learn">Build Muscle Memory home</a></nav>
          <p className="eyebrow">Lesson 1 of 1</p>
          <h1>Home Row Foundation</h1>
          <p>Stage {String.fromCharCode(65 + stages.indexOf(stage))} — {stageLabels[stage]}</p>
        </div>
      </header>
      <main className="content-shell lesson-main" id="main-content">
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
        <div className="lesson-stage-layout">
          <section className="lesson-stage-card" aria-labelledby="stage-heading">
            <h2 id="stage-heading">{stageLabels[stage]}</h2>
            {stage === 'learn' && (
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
                <p className="exercise-count">Exercise {exerciseIndex + 1} of {exercises.length}</p>
                <div className="exercise-target" aria-label={`Type: ${exercise}`}>{exercise}</div>
                <label htmlFor="lesson-input">Type the exercise</label>
                <input id="lesson-input" ref={inputRef} value={typed} onChange={handleInput} onPaste={(event) => { event.preventDefault(); setAnnouncement('Paste is disabled for guided practice.') }} autoComplete="off" autoCapitalize="off" spellCheck="false" />
                <p className="lesson-input-help">Backspace is available. Take your time and aim for accuracy.</p>
              </div>
            )}
            {stage === 'result' && (
              <div className="lesson-result">
                <dl><div><dt>Accuracy</dt><dd>{accuracy.toFixed(1)}%</dd></div><div><dt>Mistake count</dt><dd>{totalCharacters - correctCharacters}</dd></div><div><dt>Most difficult key</dt><dd>{difficultKey}</dd></div><div><dt>Lesson status</dt><dd>{mastery.passed ? 'Lesson complete' : 'More practice recommended'}</dd></div></dl>
                {!mastery.passed && <div className="repair-drill"><h3>Let’s strengthen a few keys before continuing.</h3><p>Short repair drill for {difficultKey === 'None' ? 'F' : difficultKey.toUpperCase()}</p><ol>{repairDrill.map((item) => <li key={item}>{item}</li>)}</ol></div>}
              </div>
            )}
            <div className="lesson-actions">
              {stage !== 'learn' && <button className="button button-secondary" type="button" onClick={previousStage}>Previous</button>}
              {stage !== 'learn' && stage !== 'result' && <button className="button button-secondary" type="button" onClick={retry}>Retry</button>}
              {stage === 'learn' && <button className="button button-primary" type="button" onClick={() => moveToStage('guided')}>Continue</button>}
              {stage === 'result' && <a className="button button-primary" href="/learn">Continue Lesson</a>}
            </div>
          </section>
          <FingerGuide />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default HomeRowLesson
