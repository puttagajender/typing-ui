export const DIFFICULTY_PATH = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

export const RECOMMENDATION_RULES = [
  {
    id: 'advance',
    match: 'all',
    thresholds: { minCorrectWpm: 45, minAccuracy: 97, maxMistakeCount: 3, maxWpmGap: 5 },
    difficultyAction: 'next',
    categoryAction: 'next',
    suggestedDuration: 60,
    explanation: 'Excellent accuracy and control. You are ready for a more challenging passage.',
  },
  {
    id: 'accuracy-foundations',
    match: 'any',
    thresholds: { maxAccuracy: 89.9, minMistakeCount: 10 },
    difficultyAction: 'previous',
    categoryAction: 'foundations',
    suggestedDuration: 30,
    explanation: 'Focus on careful keystrokes and consistency before increasing your pace.',
  },
  {
    id: 'consistency',
    match: 'any',
    thresholds: { minWpmGap: 8, minMistakeCount: 7 },
    difficultyAction: 'stay',
    categoryAction: 'stay',
    suggestedDuration: 30,
    explanation: 'Your speed is developing. Short, accurate sessions will help reduce avoidable mistakes.',
  },
  {
    id: 'steady-progress',
    match: 'all',
    thresholds: {},
    difficultyAction: 'stay',
    categoryAction: 'stay',
    suggestedDuration: 60,
    explanation: 'Good progress. Keep balancing accuracy and speed to build a reliable rhythm.',
  },
]
