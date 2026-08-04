const journeySteps = [
  { title: 'Learn', status: 'Build Muscle Memory', availability: 'Coming Soon' },
  { title: 'Practice', status: 'Currently Available' },
  { title: 'Improve', status: 'Currently Available' },
  { title: 'Master', status: 'Advanced Goals Coming Soon' },
]

function TypingJourney() {
  return (
    <section className="typing-journey" aria-labelledby="typing-journey-heading">
      <div className="typing-journey-heading">
        <p className="eyebrow">From foundations to mastery</p>
        <h2 id="typing-journey-heading">Your Typing Journey</h2>
      </div>
      <ol className="journey-steps">
        {journeySteps.map(({ title, status, availability }, index) => (
          <li className="journey-step" key={title}>
            <span className="journey-number" aria-hidden="true">{index + 1}</span>
            <div>
              <h3>{title}</h3>
              <p>({status})</p>
              {availability && <span className="journey-availability">{availability}</span>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default TypingJourney
