import GuidedLessonSession from './GuidedLessonSession'
import TopRowFingerGuide from './TopRowFingerGuide'

const config = {
  lessonId: 'top-row-e-i', lessonNumber: 2, title: 'Top Row Introduction — E and I', previousHref: '/learn/home-row',
  learnedKeys: 'asdfjkl;ei', focusKeys: ['e', 'i'], movementKeys: ['d', 'e', 'f', 'j', 'k', 'i', 's', 'l'],
  wordBank: ['see', 'idea', 'side', 'like', 'file', 'desk', 'idle', 'ease', 'seal', 'isle', 'field', 'slide', 'skill', 'aside', 'failed'],
  introduction: 'Move the left middle finger from D to E and the right middle finger from K to I. After each press, return immediately to D or K and keep the remaining fingers relaxed.',
  placement: 'D and E share the left middle finger. K and I share the right middle finger.', movement: 'Reach upward with one middle finger while the hand stays level.', homePosition: 'Return to D or K after every E or I.', commonMistakes: 'Avoid moving the whole hand or leaving a middle finger on the top row.', returnInstruction: 'Return your middle fingers to D and K.',
  fingerInstructions: { a: 'Press A with your left pinky.', s: 'Press S with your left ring finger.', d: 'Return your left middle finger to D.', f: 'Press F with your left index finger.', j: 'Press J with your right index finger.', k: 'Return your right middle finger to K.', l: 'Press L with your right ring finger.', ';': 'Press ; with your right pinky.', e: 'Press E with your left middle finger.', i: 'Press I with your right middle finger.', ' ': 'Press Space with either thumb.' },
}

export default function TopRowLesson() { return <GuidedLessonSession config={config} FingerGuide={TopRowFingerGuide} /> }
