const questions = [
  ['What does WPM mean?', 'WPM means words per minute. Typing Coach displays the official result returned by the typing service after your attempt.'],
  ['How can I improve my Typing Accuracy?', 'Slow down, use consistent finger placement, and focus on correct keys before trying to increase speed.'],
  ['When does a timed practice begin?', 'The timer starts with your first character. You can finish early or complete the full passage.'],
  ['Can I repeat the same Typing Practice?', 'Yes. Use Restart Test or Try Again to clear the attempt and practise the passage again.'],
]

function FaqSection() {
  return (
    <section className="landing-section content-shell faq-section" aria-labelledby="faq-heading">
      <div className="section-heading">
        <p className="eyebrow">Common questions</p>
        <h2 id="faq-heading">Typing Coach FAQ</h2>
      </div>
      <div className="faq-list">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default FaqSection
