const homeKeys = [
  ['A', 'Left pinky'], ['S', 'Left ring'], ['D', 'Left middle'], ['F', 'Left index'],
  ['J', 'Right index'], ['K', 'Right middle'], ['L', 'Right ring'], [';', 'Right pinky'],
]

function TopRowFingerGuide() {
  return (
    <section className="finger-guide top-row-finger-guide" aria-labelledby="top-row-guide-heading">
      <div className="finger-guide-heading">
        <h2 id="top-row-guide-heading">E and I finger guide</h2>
        <p>Use the middle fingers, then return them to their home keys.</p>
      </div>
      <div className="top-row-movements" aria-label="E and I keyboard finger movement">
        <div className="movement-column left-middle">
          <div className="finger-key active-key"><strong>E</strong><span>Left middle finger</span></div>
          <span className="return-indicator" aria-label="Return from E to D">↓ Return to D</span>
          <div className="finger-key home-anchor"><strong>D</strong><span>Left middle · Home</span></div>
        </div>
        <div className="movement-column right-middle">
          <div className="finger-key active-key"><strong>I</strong><span>Right middle finger</span></div>
          <span className="return-indicator" aria-label="Return from I to K">↓ Return to K</span>
          <div className="finger-key home-anchor"><strong>K</strong><span>Right middle · Home</span></div>
        </div>
      </div>
      <div className="secondary-home-row" aria-label="Previously learned home-row keys">
        {homeKeys.map(([key, finger]) => <div className="secondary-key" key={key}><strong>{key}</strong><span>{finger}</span></div>)}
      </div>
      <p className="guide-text-instruction"><strong>E:</strong> move your left middle finger up from D. <strong>I:</strong> move your right middle finger up from K.</p>
    </section>
  )
}

export default TopRowFingerGuide
