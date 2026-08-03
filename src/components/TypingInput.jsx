import { forwardRef } from 'react'

const TypingInput = forwardRef(function TypingInput(
  { value, onChange, disabled, maxLength },
  ref,
) {
  const preventPaste = (event) => event.preventDefault()

  return (
    <div className="input-group">
      <label htmlFor="typing-input">Your typing</label>
      <textarea
        id="typing-input"
        ref={ref}
        value={value}
        onChange={onChange}
        onPaste={preventPaste}
        onDrop={preventPaste}
        disabled={disabled}
        maxLength={maxLength}
        rows="4"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        placeholder="Start typing here to begin the timer..."
        aria-describedby="typing-help"
      />
      <p id="typing-help" className="input-help">Pasting is disabled for this exercise.</p>
    </div>
  )
})

export default TypingInput
