const learnedKeys = [
  ['A', 'Left pinky'], ['S', 'Left ring'], ['D', 'Left middle'], ['F', 'Left index · Guide key'],
  ['J', 'Right index · Guide key'], ['K', 'Right middle'], ['L', 'Right ring'], [';', 'Right pinky'],
  ['E', 'Left middle'], ['I', 'Right middle'],
]

function BottomRowFingerGuide() {
  return (
    <section className="finger-guide bottom-row-finger-guide" aria-labelledby="bottom-row-guide-heading">
      <div className="finger-guide-heading"><h2 id="bottom-row-guide-heading">C and N finger guide</h2><p>Move down from the home row, then return immediately.</p></div>
      <div className="bottom-row-movements" aria-label="C and N keyboard finger movement">
        <div className="movement-column left-middle">
          <div className="finger-key home-anchor"><strong>D</strong><span>Left middle · Home</span></div>
          <span className="downward-indicator" aria-label="Move down from D to C">↓ Move down</span>
          <div className="finger-key active-key"><strong>C</strong><span>Left middle finger</span></div>
          <span className="return-indicator">↑ Return to D</span>
        </div>
        <div className="movement-column right-index">
          <div className="finger-key home-anchor guide-anchor"><strong>J</strong><span>Right index · Home · Guide key</span></div>
          <span className="downward-indicator" aria-label="Move down from J to N">↓ Move down</span>
          <div className="finger-key active-key"><strong>N</strong><span>Right index finger</span></div>
          <span className="return-indicator">↑ Return to J</span>
        </div>
      </div>
      <div className="secondary-home-row learned-key-grid" aria-label="Previously learned keys">
        {learnedKeys.map(([key, finger]) => <div className={`secondary-key ${key === 'F' || key === 'J' ? 'secondary-guide-key' : ''}`} key={key}><strong>{key}</strong><span>{finger}</span></div>)}
      </div>
      <p className="guide-text-instruction"><strong>C:</strong> move your left middle finger down from D. <strong>N:</strong> move your right index finger down from J. Keep the other fingers resting.</p>
    </section>
  )
}

export default BottomRowFingerGuide
