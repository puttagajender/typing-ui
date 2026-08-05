import FingerGuide from './FingerGuide'
import GuidedLessonSession from './GuidedLessonSession'

const config = {
  lessonId: 'home-row', lessonNumber: 1, title: 'Home Row Foundation', previousHref: null,
  learnedKeys: 'asdfjkl;', focusKeys: ['f', 'j', 'a', ';'], movementKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
  wordBank: ['sad', 'dad', 'fall', 'ask', 'all', 'lad', 'flask', 'salad', 'salsa', 'falls', 'asks', 'dads', 'lads', 'adds', 'flasks'],
  introduction: 'Every finger has a permanent home. After pressing a key, return that finger to its home position. This relaxed return movement is the foundation of touch typing.',
  placement: 'Left fingers rest on A S D F. Right fingers rest on J K L ;. Thumbs rest near Space.',
  movement: 'Press with the assigned finger while the other fingers stay relaxed and close to their home keys.',
  homePosition: 'Use the raised bumps on F and J to find the home row without looking down.',
  commonMistakes: 'Avoid lifting the whole hand, reaching with the wrong finger, or pressing harder when uncertain.',
  returnInstruction: 'Return your fingers to the home row.',
  fingerInstructions: { a: 'Press A with your left pinky.', s: 'Press S with your left ring finger.', d: 'Press D with your left middle finger.', f: 'Press F with your left index finger.', j: 'Press J with your right index finger.', k: 'Press K with your right middle finger.', l: 'Press L with your right ring finger.', ';': 'Press ; with your right pinky.', ' ': 'Press Space with either thumb.' },
}

export default function HomeRowLesson() { return <GuidedLessonSession config={config} FingerGuide={FingerGuide} /> }
