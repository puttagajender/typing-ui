import { describe, expect, it } from 'vitest'
import { createCoachRecommendation } from './recommendationEngine'

describe('coach recommendation engine', () => {
  it('advances difficulty for fast, highly accurate typing with few mistakes', () => {
    const recommendation = createCoachRecommendation({
      correctWpm: 52,
      grossWpm: 55,
      accuracy: 98.5,
      mistakeCount: 2,
    }, 'BEGINNER', 'General English')

    expect(recommendation).toMatchObject({
      ruleId: 'advance',
      nextDifficulty: 'INTERMEDIATE',
      suggestedDuration: 60,
      suggestedCategory: 'Common Words',
    })
  })

  it('keeps the highest difficulty when an advanced learner qualifies to advance', () => {
    const recommendation = createCoachRecommendation({
      wpm: 70,
      grossWpm: 73,
      accuracy: 99,
      mistakeCount: 1,
    }, 'EXPERT', 'Git')

    expect(recommendation.nextDifficulty).toBe('EXPERT')
    expect(recommendation.metrics.correctWpm).toBe(70)
  })

  it('steps down and recommends accuracy foundations when accuracy is low', () => {
    const recommendation = createCoachRecommendation({
      correctWpm: 31,
      grossWpm: 38,
      accuracy: 84,
      mistakeCount: 8,
    }, 'ADVANCED', 'SQL')

    expect(recommendation).toMatchObject({
      ruleId: 'accuracy-foundations',
      nextDifficulty: 'INTERMEDIATE',
      suggestedDuration: 30,
      suggestedCategory: 'General English',
    })
  })

  it('does not step below Beginner', () => {
    const recommendation = createCoachRecommendation({
      correctWpm: 18,
      grossWpm: 25,
      accuracy: 78,
      mistakeCount: 15,
    }, 'BEGINNER', 'General English')

    expect(recommendation.nextDifficulty).toBe('BEGINNER')
  })

  it('recommends short consistency practice for a large gross-to-correct WPM gap', () => {
    const recommendation = createCoachRecommendation({
      correctWpm: 38,
      grossWpm: 48,
      accuracy: 94,
      mistakeCount: 5,
    }, 'INTERMEDIATE', 'Business English')

    expect(recommendation).toMatchObject({
      ruleId: 'consistency',
      nextDifficulty: 'INTERMEDIATE',
      suggestedDuration: 30,
      suggestedCategory: 'Business English',
    })
  })

  it('recommends balanced practice for steady results', () => {
    const recommendation = createCoachRecommendation({
      correctWpm: 38,
      grossWpm: 41,
      accuracy: 95,
      mistakeCount: 4,
    }, 'INTERMEDIATE', 'Java')

    expect(recommendation).toMatchObject({
      ruleId: 'steady-progress',
      nextDifficulty: 'INTERMEDIATE',
      suggestedDuration: 60,
      suggestedCategory: 'Java',
    })
  })

  it('uses recommendation fields returned by the backend when available', () => {
    const recommendation = createCoachRecommendation({
      correctWpm: 38,
      grossWpm: 41,
      accuracy: 95,
      mistakeCount: 4,
      recommendedDifficulty: 'HARD',
      recommendedCategory: 'JAVA',
      recommendedDuration: 120,
      recommendationReason: 'Backend recommendation reason.',
    }, 'BEGINNER', 'Java')

    expect(recommendation).toMatchObject({
      nextDifficulty: 'ADVANCED',
      suggestedCategory: 'Java',
      suggestedDuration: 120,
      explanation: 'Backend recommendation reason.',
    })
  })
})
