const keys = [
  ['A', 'Left pinky', 'left'],
  ['S', 'Left ring', 'left'],
  ['D', 'Left middle', 'left'],
  ['F', 'Left index', 'left guide'],
  ['J', 'Right index', 'right guide'],
  ['K', 'Right middle', 'right'],
  ['L', 'Right ring', 'right'],
  [';', 'Right pinky', 'right'],
]

function FingerGuide() {
  return (
    <section className="finger-guide" aria-labelledby="finger-guide-heading">
      <div className="finger-guide-heading">
        <h2 id="finger-guide-heading">Home row finger guide</h2>
        <p>Left and right labels show which hand and finger controls each key.</p>
      </div>
      <div className="home-row-keyboard" aria-label="Home row keyboard layout">
        {keys.map(([key, finger, className]) => (
          <div className={`finger-key ${className}`} key={key}>
            <strong>{key}</strong>
            <span>{finger}</span>
            {className.includes('guide') && <small>Guide bump</small>}
          </div>
        ))}
        <div className="finger-key thumb-key"><strong>Space</strong><span>Thumbs</span></div>
      </div>
    </section>
  )
}

export default FingerGuide
