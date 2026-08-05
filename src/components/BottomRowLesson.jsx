import BottomRowFingerGuide from './BottomRowFingerGuide'
import GuidedLessonSession from './GuidedLessonSession'

const config = {
  lessonId: 'bottom-row-c-n', lessonNumber: 3, title: 'Bottom Row Introduction — C and N', previousHref: '/learn/top-row-e-i',
  learnedKeys: 'asdfjkl;eicn', focusKeys: ['c', 'n'], movementKeys: ['d', 'c', 'f', 'j', 'n', 'k', 'e', 'i'],
  wordBank: ['can', 'nice', 'dance', 'scan', 'sand', 'desk', 'find', 'line', 'case', 'neck', 'clean', 'since', 'inside', 'finance', 'silence'],
  introduction: 'Move the left middle finger down from D to C and the right index finger down from J to N. Return to D or J after every press while the other fingers remain on the home row.',
  placement: 'D and C share the left middle finger. J and N share the right index finger.', movement: 'Reach downward without rotating or lifting the hand.', homePosition: 'Return to D or J after every C or N.', commonMistakes: 'Avoid collapsing the wrist, moving every finger, or leaving the active finger below the home row.', returnInstruction: 'Return your fingers to D and J.',
  fingerInstructions: { a: 'Press A with your left pinky.', s: 'Press S with your left ring finger.', d: 'Return your left middle finger to D.', f: 'Press F with your left index finger.', j: 'Return your right index finger to J.', k: 'Press K with your right middle finger.', l: 'Press L with your right ring finger.', ';': 'Press ; with your right pinky.', e: 'Press E with your left middle finger.', i: 'Press I with your right middle finger.', c: 'Press C with your left middle finger.', n: 'Press N with your right index finger.', ' ': 'Press Space with either thumb.' },
}

export default function BottomRowLesson() { return <GuidedLessonSession config={config} FingerGuide={BottomRowFingerGuide} /> }
