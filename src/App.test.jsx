import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { PASSAGE, PASSAGES } from './data/passages'
import { analyzeTyping } from './services/typingApi'

vi.mock('./services/typingApi', () => ({ analyzeTyping: vi.fn() }))

const completeResult = {
  correctWpm: 42.3,
  grossWpm: 45.7,
  wpm: 42.3,
  accuracy: 96.4,
  durationInSeconds: 31.2,
  mistakeCount: 4,
  wrongCharacterCount: 2,
  missingCharacterCount: 1,
  extraCharacterCount: 1,
}

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('Typing Coach application', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    analyzeTyping.mockReset()
    analyzeTyping.mockResolvedValue(completeResult)
  })

  afterEach(() => vi.useRealTimers())

  it('shows the initial application, passage, accessible controls, and zero elapsed time', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Typing Coach' })).toBeVisible()
    expect(screen.getByLabelText('Text to type')).toHaveTextContent(PASSAGE)
    expect(screen.getByRole('textbox', { name: 'Your typing' })).toBeEnabled()
    expect(screen.getByText('60.0')).toBeVisible()
    expect(screen.getByLabelText('Level')).toHaveValue('BEGINNER')
    expect(screen.getByLabelText('Practice topic')).toHaveValue('General English')
    expect(screen.getByLabelText('Test length')).toHaveValue('60')
    expect(screen.getByText('Start typing to begin.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Finish Test' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Restart Test' })).toBeEnabled()
  })

  it('starts on the first character and applies correct, current, and untyped classes', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), PASSAGE[0])
    const characters = screen.getByLabelText('Text to type').querySelectorAll('.passage-character')

    expect(screen.getByRole('button', { name: 'Finish Test' })).toBeEnabled()
    expect(characters[0]).toHaveClass('correct')
    expect(characters[1]).toHaveClass('current')
    expect(characters[2]).toHaveClass('untyped')
  })

  it('marks an incorrect typed character', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'x')

    expect(screen.getByLabelText('Text to type').querySelector('.passage-character')).toHaveClass('incorrect')
  })

  it('does not accept text beyond the passage length', () => {
    render(<App />)
    const input = screen.getByRole('textbox', { name: 'Your typing' })

    fireEvent.change(input, { target: { value: `${PASSAGE}extra text` } })

    expect(input).toHaveValue(PASSAGE)
    expect(input.value).toHaveLength(PASSAGE.length)
  })

  it('prevents paste into the typing input', () => {
    render(<App />)
    const input = screen.getByRole('textbox', { name: 'Your typing' })

    expect(fireEvent.paste(input, { clipboardData: { getData: () => 'pasted text' } })).toBe(false)
    expect(input).toHaveValue('')
  })

  it('does not submit an empty attempt', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Finish Test' }))

    expect(analyzeTyping).not.toHaveBeenCalled()
  })

  it('restarts by clearing typed text and resetting elapsed time', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByRole('textbox', { name: 'Your typing' })

    await user.type(input, 'E')
    await user.click(screen.getByRole('button', { name: 'Restart Test' }))

    expect(input).toHaveValue('')
    expect(screen.getByText('60.0')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Finish Test' })).toBeDisabled()
  })

  it('restarts by clearing a displayed result', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockResolvedValue(completeResult)
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'E')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    expect(await screen.findByRole('heading', { name: 'Your results' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Restart Test' }))
    expect(screen.queryByRole('heading', { name: 'Your results' })).not.toBeInTheDocument()
  })

  it('restarts by clearing an error notification', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockRejectedValue(new Error('Please check the attempt and try again.'))
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'E')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    expect(await screen.findByRole('alert')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Restart Test' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('prevents duplicate submissions and disables Finish while submitting', async () => {
    const user = userEvent.setup()
    const request = deferred()
    analyzeTyping.mockReturnValue(request.promise)
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'E')
    const finishButton = screen.getByRole('button', { name: 'Finish Test' })
    await user.dblClick(finishButton)

    expect(analyzeTyping).toHaveBeenCalledTimes(1)
    expect(finishButton).toBeDisabled()
    request.resolve(completeResult)
    await screen.findByRole('heading', { name: 'Your results' })
  })

  it('sends the expected request body with ISO timestamps', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockResolvedValue(completeResult)
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), PASSAGE.slice(0, 2))
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    await waitFor(() => expect(analyzeTyping).toHaveBeenCalledOnce())

    const request = analyzeTyping.mock.calls[0][0]
    expect(request).toMatchObject({ originalText: PASSAGE.slice(0, 2), typedText: PASSAGE.slice(0, 2) })
    expect(new Date(request.startedAt).toISOString()).toBe(request.startedAt)
    expect(new Date(request.completedAt).toISOString()).toBe(request.completedAt)
  })

  it('shows an accessible loading status while the backend is pending', async () => {
    const user = userEvent.setup()
    const request = deferred()
    analyzeTyping.mockReturnValue(request.promise)
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'E')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))

    expect(screen.getByRole('status')).toHaveTextContent('Analysing your typing...')
    request.resolve(completeResult)
    await screen.findByRole('heading', { name: 'Your results' })
  })

  it('displays successful WPM, accuracy, duration, and mistake metrics without optional details', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockResolvedValue(completeResult)
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'E')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    const results = await screen.findByRole('heading', { name: 'Your results' })
    const panel = results.closest('section')

    expect(within(panel).getByText('42.3')).toBeVisible()
    expect(within(panel).getByText('96.4%')).toBeVisible()
    expect(within(panel).getByText('31.2 seconds')).toBeVisible()
    expect(within(panel).getByText('Total Mistakes').nextElementSibling).toHaveTextContent('4')
    expect(within(panel).getByText('Wrong Characters').nextElementSibling).toHaveTextContent('2')
    expect(within(panel).getByText('Missing Characters').nextElementSibling).toHaveTextContent('1')
    expect(within(panel).getByText('Extra Characters').nextElementSibling).toHaveTextContent('1')
  })

  it('uses wpm when correctWpm is absent', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockResolvedValue({ ...completeResult, correctWpm: undefined, wpm: 37.8 })
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'E')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))

    const resultsPanel = (await screen.findByRole('heading', { name: 'Your results' })).closest('section')
    expect(within(resultsPanel).getByText('37.8')).toBeVisible()
  })

  it('displays zero mistake counts and distinguishes missing result fields', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockResolvedValue({
      wpm: 39.6,
      accuracy: 100,
      durationInSeconds: 30,
      mistakeCount: 0,
      wrongCharacterCount: 0,
      missingCharacterCount: 0,
      extraCharacterCount: null,
    })
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'E')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    const panel = (await screen.findByRole('heading', { name: 'Your results' })).closest('section')

    expect(within(panel).getByText('Gross WPM').nextElementSibling).toHaveTextContent('Not available')
    expect(within(panel).getByText('Total Mistakes').nextElementSibling).toHaveTextContent('0')
    expect(within(panel).getByText('Wrong Characters').nextElementSibling).toHaveTextContent('0')
    expect(within(panel).getByText('Missing Characters').nextElementSibling).toHaveTextContent('0')
    expect(within(panel).getByText('Extra Characters').nextElementSibling).toHaveTextContent('Not available')
    expect(screen.getByText('Excellent accuracy. You are ready for a harder passage.')).toBeVisible()
  })

  it('shows a friendly validation error using alert semantics', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockRejectedValue(new Error('Please check the attempt and try again.'))
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'E')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please check the attempt and try again.')
  })

  it('shows a friendly network failure without crashing', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockRejectedValue(new Error('Could not connect to the typing service. Make sure the backend is running.'))
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'E')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not connect to the typing service')
  })

  it('changes difficulty and displays a passage from the selected category', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Level'), 'ADVANCED')

    expect(screen.getByLabelText('Level')).toHaveValue('ADVANCED')
    expect(screen.getByLabelText('Text to type')).toHaveTextContent(
      PASSAGES.find((passage) => passage.category === 'General English' && passage.difficulty === 'ADVANCED').text,
    )
  })

  it('selects a new passage without immediately repeating the current passage', async () => {
    const user = userEvent.setup()
    render(<App />)
    const initialPassage = screen.getByLabelText('Text to type').textContent

    await user.click(screen.getByRole('button', { name: 'New Passage' }))

    expect(screen.getByLabelText('Text to type')).toHaveTextContent(
      PASSAGES.find((passage) => passage.id === 'general-english-2').text,
    )
    expect(screen.getByLabelText('Text to type').textContent).not.toBe(initialPassage)
  })

  it.each([
    ['30', '30.0'],
    ['60', '60.0'],
    ['120', '120.0'],
  ])('configures the %s-second timed mode', async (mode, displayedSeconds) => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Test length'), mode)

    expect(screen.getByLabelText('Test length')).toHaveValue(mode)
    expect(screen.getByText(displayedSeconds)).toBeVisible()
    expect(screen.getByText('seconds remaining')).toBeVisible()
  })

  it('automatically submits complete-passage mode when the passage is finished', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Test length'), 'complete')
    const completePassage = screen.getByLabelText('Text to type').textContent
    fireEvent.change(screen.getByRole('textbox', { name: 'Your typing' }), { target: { value: completePassage } })

    await waitFor(() => expect(analyzeTyping).toHaveBeenCalledOnce())
    expect(analyzeTyping.mock.calls[0][0]).toMatchObject({ originalText: completePassage, typedText: completePassage })
  })

  it('automatically submits when a 30-second test reaches zero', async () => {
    vi.useFakeTimers()
    render(<App />)

    fireEvent.change(screen.getByLabelText('Test length'), { target: { value: '30' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Your typing' }), { target: { value: 'A calm' } })
    await act(async () => vi.advanceTimersByTime(30100))

    expect(analyzeTyping).toHaveBeenCalledOnce()
    expect(screen.getByText('Time is up. Your test was submitted automatically.')).toBeInTheDocument()
  })

  it('restart preserves the selected timed mode and resets its countdown', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Test length'), '60')
    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.click(screen.getByRole('button', { name: 'Restart Test' }))

    expect(screen.getByLabelText('Test length')).toHaveValue('60')
    expect(screen.getByRole('textbox', { name: 'Your typing' })).toHaveValue('')
    expect(screen.getByText('60.0')).toBeVisible()
  })

  it('new passage clears an existing result', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    expect(await screen.findByRole('heading', { name: 'Your results' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'New Passage' }))

    expect(screen.queryByRole('heading', { name: 'Your results' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Your typing' })).toHaveValue('')
  })

  it('sends only the attempted original-text portion for a timed test', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Test length'), '30')
    const attemptedText = screen.getByLabelText('Text to type').textContent.slice(0, 6)
    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), attemptedText)
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    await waitFor(() => expect(analyzeTyping).toHaveBeenCalledOnce())

    expect(analyzeTyping.mock.calls[0][0]).toMatchObject({
      originalText: attemptedText,
      typedText: attemptedText,
    })
  })

  it('appends a different suitable passage before a timed-session buffer runs out', async () => {
    render(<App />)
    const input = screen.getByRole('textbox', { name: 'Your typing' })
    const firstPassage = screen.getByLabelText('Text to type').textContent

    fireEvent.change(input, { target: { value: firstPassage.slice(0, -20) } })

    await waitFor(() => expect(screen.getByLabelText('Text to type').textContent.length).toBeGreaterThan(firstPassage.length))
    const bufferedText = screen.getByLabelText('Text to type').textContent
    const secondPassage = PASSAGES.find((passage) => passage.category === 'General English' && passage.difficulty === 'BEGINNER' && passage.text !== firstPassage)
    expect(bufferedText).toBe(`${firstPassage} ${secondPassage.text}`)
    const currentCharacter = screen.getByLabelText('Text to type').querySelector('.passage-character.current')
    expect(currentCharacter).toHaveTextContent(bufferedText[firstPassage.length - 20])
    expect(analyzeTyping).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Finish Test' })).toBeEnabled()
  })

  it('can append multiple passages without resetting typing progress or the timer', async () => {
    render(<App />)
    const input = screen.getByRole('textbox', { name: 'Your typing' })
    const firstPassage = screen.getByLabelText('Text to type').textContent
    fireEvent.change(input, { target: { value: firstPassage.slice(0, -20) } })
    await waitFor(() => expect(screen.getByLabelText('Text to type').textContent.length).toBeGreaterThan(firstPassage.length))
    const twoPassages = screen.getByLabelText('Text to type').textContent
    const typedAcrossBoundary = twoPassages.slice(0, -20)

    fireEvent.change(input, { target: { value: typedAcrossBoundary } })

    await waitFor(() => expect(screen.getByLabelText('Text to type').textContent.length).toBeGreaterThan(twoPassages.length))
    expect(input).toHaveValue(typedAcrossBoundary)
    expect(screen.getByRole('progressbar', { name: 'Typing progress' })).toHaveAttribute('aria-valuenow', String(typedAcrossBoundary.length))
    await waitFor(() => expect(Number(document.querySelector('.timer-stat strong').textContent)).toBeLessThan(60))
    expect(analyzeTyping).not.toHaveBeenCalled()
  })

  it('submits reached text only and excludes the unused timed buffer', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByRole('textbox', { name: 'Your typing' })
    const firstPassage = screen.getByLabelText('Text to type').textContent
    fireEvent.change(input, { target: { value: firstPassage.slice(0, -20) } })
    await waitFor(() => expect(screen.getByLabelText('Text to type').textContent.length).toBeGreaterThan(firstPassage.length))
    const presentedText = screen.getByLabelText('Text to type').textContent

    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    await waitFor(() => expect(analyzeTyping).toHaveBeenCalledOnce())

    const request = analyzeTyping.mock.calls[0][0]
    expect(request.originalText).toBe(firstPassage.slice(0, -20))
    expect(request.typedText).toBe(firstPassage.slice(0, -20))
    expect(request.originalText.length).toBeLessThan(presentedText.length)
  })

  it('restart clears appended passages and restores the original timed passage', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByRole('textbox', { name: 'Your typing' })
    const firstPassage = screen.getByLabelText('Text to type').textContent
    fireEvent.change(input, { target: { value: firstPassage.slice(0, -20) } })
    await waitFor(() => expect(screen.getByLabelText('Text to type').textContent.length).toBeGreaterThan(firstPassage.length))

    await user.click(screen.getByRole('button', { name: 'Restart Test' }))

    expect(screen.getByLabelText('Text to type')).toHaveTextContent(firstPassage)
    expect(screen.getByLabelText('Text to type').textContent).toBe(firstPassage)
    expect(input).toHaveValue('')
    expect(screen.getByText('60.0')).toBeVisible()
  })

  it('changing practice settings clears the generated timed passage sequence', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByRole('textbox', { name: 'Your typing' })
    const firstPassage = screen.getByLabelText('Text to type').textContent
    fireEvent.change(input, { target: { value: firstPassage.slice(0, -20) } })
    await waitFor(() => expect(screen.getByLabelText('Text to type').textContent.length).toBeGreaterThan(firstPassage.length))

    await user.selectOptions(screen.getByLabelText('Practice topic'), 'Java')
    await user.click(screen.getByRole('button', { name: 'Discard and Change Settings' }))

    const resetText = screen.getByLabelText('Text to type').textContent
    expect(PASSAGES.some((passage) => passage.category === 'Java' && passage.difficulty === 'BEGINNER' && passage.text === resetText)).toBe(true)
    expect(input).toHaveValue('')
    expect(screen.getByRole('progressbar', { name: 'Typing progress' })).toHaveAttribute('aria-valuenow', '0')
  })

  it('displays and stores a coach recommendation after a completed test', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))

    expect(await screen.findByRole('heading', { name: 'Your next best step' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Continue Recommended Practice' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Practice Again' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Choose Another Practice' })).toBeVisible()
    await waitFor(() => expect(window.localStorage.getItem('typing-coach:last-recommendation')).not.toBeNull())
  })

  it('continues with the recommended duration and clears the completed result', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    const completedPassage = screen.getByLabelText('Text to type').textContent
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    await user.click(await screen.findByRole('button', { name: 'Continue Recommended Practice' }))

    expect(screen.getByLabelText('Test length')).toHaveValue('60')
    expect(screen.queryByRole('heading', { name: 'Your results' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Your typing' })).toBeEnabled()
    expect(screen.getByRole('textbox', { name: 'Your typing' })).toHaveValue('')
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Your typing' })).toHaveFocus())
    expect(screen.getByText('Start typing to begin.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Finish Test' })).toBeDisabled()
    expect(screen.getByRole('progressbar', { name: 'Typing progress' })).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByLabelText('Text to type').textContent).not.toBe(completedPassage)
  })

  it('starts a fully reset, immediately usable session with every recommended setting', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockResolvedValue({
      ...completeResult,
      recommendedDifficulty: 'HARD',
      recommendedCategory: 'SQL',
      recommendedDuration: 120,
      recommendationReason: 'Continue with a focused technical session.',
      comparisonItems: [{ type: 'MISSING_CHARACTER', originalIndex: 0, expectedCharacter: 'A' }],
    })
    render(<App />)
    const previousPassage = screen.getByLabelText('Text to type').textContent

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    await user.click(await screen.findByRole('button', { name: 'Continue Recommended Practice' }))

    const input = screen.getByRole('textbox', { name: 'Your typing' })
    expect(screen.getByLabelText('Level')).toHaveValue('ADVANCED')
    expect(screen.getByLabelText('Practice topic')).toHaveValue('SQL')
    expect(screen.getByLabelText('Test length')).toHaveValue('120')
    expect(screen.getByLabelText('Text to type').textContent).not.toBe(previousPassage)
    expect(PASSAGES.some((passage) => passage.category === 'SQL' && passage.difficulty === 'ADVANCED' && passage.text === screen.getByLabelText('Text to type').textContent)).toBe(true)
    expect(input).toBeEnabled()
    expect(input).toHaveValue('')
    await waitFor(() => expect(input).toHaveFocus())
    expect(screen.queryByRole('heading', { name: 'Your results' })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText('Analysing your typing...')).not.toBeInTheDocument()
    expect(screen.getByText('120.0')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Finish Test' })).toBeDisabled()
    expect(screen.getByRole('progressbar', { name: 'Typing progress' })).toHaveAttribute('aria-valuenow', '0')
    expect(document.querySelector('.passage-character.missing')).not.toBeInTheDocument()

    fireEvent.change(input, { target: { value: screen.getByLabelText('Text to type').textContent[0] } })
    expect(screen.getByRole('button', { name: 'Finish Test' })).toBeEnabled()
    expect(screen.queryByText('Start typing to begin.')).not.toBeInTheDocument()
    await waitFor(() => expect(Number(document.querySelector('.timer-stat strong').textContent)).toBeLessThan(120))
  })

  it('lets the user choose another practice and clears the completed result', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    await user.click(await screen.findByRole('button', { name: 'Choose Another Practice' }))

    expect(screen.queryByRole('heading', { name: 'Your results' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Your typing' })).toHaveValue('')
    const settingsTarget = screen.getByRole('heading', { name: 'Practice settings' }).closest('.settings-focus-target')
    await waitFor(() => expect(settingsTarget).toHaveFocus())
    expect(screen.getByText('Practice settings ready. Choose a different level, topic or test length.')).toBeInTheDocument()
  })

  it('welcomes a returning user with their stored recommendation', () => {
    window.localStorage.setItem('typing-coach:last-recommendation', JSON.stringify({
      nextDifficulty: 'INTERMEDIATE',
      suggestedDuration: 60,
      suggestedCategory: 'Common Words',
      explanation: 'Keep building a reliable rhythm.',
    }))

    render(<App />)

    const welcomeCard = screen.getByRole('heading', { name: 'Your recommended next practice is ready.' }).closest('aside')
    expect(within(welcomeCard).getByText('Intermediate')).toBeVisible()
  })

  it('dismisses the welcome recommendation without clearing stored data', async () => {
    const user = userEvent.setup()
    const stored = { nextDifficulty: 'INTERMEDIATE', suggestedDuration: 60, suggestedCategory: 'Common Words', explanation: 'Keep building a reliable rhythm.' }
    window.localStorage.setItem('typing-coach:last-recommendation', JSON.stringify(stored))
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByText('Your recommended next practice is ready.')).not.toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('typing-coach:last-recommendation'))).toMatchObject(stored)
  })

  it('loads passages from the manually selected category and level', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Practice topic'), 'Java')
    await user.selectOptions(screen.getByLabelText('Level'), 'INTERMEDIATE')

    const shownText = screen.getByLabelText('Text to type').textContent
    expect(PASSAGES.some((passage) =>
      passage.category === 'Java' && passage.difficulty === 'INTERMEDIATE' && passage.text === shownText,
    )).toBe(true)
  })

  it('confirms before discarding an active test for a manual selection', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.selectOptions(screen.getByLabelText('Practice topic'), 'Git')
    expect(screen.getByLabelText('Practice topic')).toHaveValue('General English')
    expect(screen.getByRole('textbox', { name: 'Your typing' })).toHaveValue('A')
    expect(screen.getByRole('alertdialog')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Continue Current Test' }))

    await user.selectOptions(screen.getByLabelText('Practice topic'), 'Git')
    await user.click(screen.getByRole('button', { name: 'Discard and Change Settings' }))
    expect(screen.getByLabelText('Practice topic')).toHaveValue('Git')
    expect(screen.getByRole('textbox', { name: 'Your typing' })).toHaveValue('')
  })

  it('shows and validates a custom duration', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Test length'), 'custom')
    const customInput = screen.getByLabelText('Custom seconds')
    expect(customInput).toHaveValue(60)

    fireEvent.change(customInput, { target: { value: '10' } })
    expect(customInput).toHaveValue(10)
    expect(customInput).toHaveAccessibleDescription('Duration must be at least 15 seconds.')
    expect(customInput).toHaveAttribute('aria-invalid', 'true')
    fireEvent.change(customInput, { target: { value: '301' } })
    expect(customInput).toHaveValue(301)
    expect(customInput).toHaveAccessibleDescription('Duration must be 300 seconds or less.')
    fireEvent.change(customInput, { target: { value: '180' } })
    expect(customInput).toHaveValue(180)
    expect(customInput).toHaveAttribute('aria-invalid', 'false')
  })

  it('handles corrupted localStorage without crashing', () => {
    window.localStorage.setItem('typing-coach:practice-settings', '{invalid')
    window.localStorage.setItem('typing-coach:last-recommendation', '{invalid')

    render(<App />)

    expect(screen.getByLabelText('Level')).toHaveValue('BEGINNER')
    expect(screen.getByLabelText('Practice topic')).toHaveValue('General English')
    expect(screen.queryByText('Your recommended next practice is ready.')).not.toBeInTheDocument()
  })

  it('continues a welcome-back recommendation with all expected settings', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('typing-coach:last-recommendation', JSON.stringify({
      nextDifficulty: 'ADVANCED',
      suggestedDuration: 120,
      suggestedCategory: 'SQL',
      explanation: 'Continue with a focused technical session.',
    }))
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByLabelText('Level')).toHaveValue('ADVANCED')
    expect(screen.getByLabelText('Practice topic')).toHaveValue('SQL')
    expect(screen.getByLabelText('Test length')).toHaveValue('120')
    const shownText = screen.getByLabelText('Text to type').textContent
    expect(PASSAGES.some((passage) => passage.category === 'SQL' && passage.difficulty === 'ADVANCED' && passage.text === shownText)).toBe(true)
  })

  it('subtly marks matching recommended setting values', () => {
    window.localStorage.setItem('typing-coach:last-recommendation', JSON.stringify({
      nextDifficulty: 'BEGINNER',
      suggestedDuration: 60,
      suggestedCategory: 'General English',
      explanation: 'Keep building a steady rhythm.',
    }))
    render(<App />)

    expect(screen.getAllByText('Recommended')).toHaveLength(3)
  })

  it('updates and persists the local progress dashboard after a completed test', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText('Your progress will appear after your first completed session.')).toBeVisible()
    expect(screen.queryByText('Tests Completed')).not.toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    await screen.findByRole('heading', { name: 'Your results' })

    expect(screen.getByText('Tests Completed').nextElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Best WPM').nextElementSibling).toHaveTextContent('42.3')
    expect(screen.getByText('Average Accuracy').nextElementSibling).toHaveTextContent('96.4%')
    expect(JSON.parse(window.localStorage.getItem('typing-coach:progress'))).toMatchObject({
      totalTestsCompleted: 1,
      totalCharactersTyped: 1,
    })
  })

  it('displays weak keys, their summary, and suggested practice words', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockResolvedValue({
      ...completeResult,
      weakKeySummary: 'The letters r and t need more consistent control.',
      weakKeys: [
        { character: 'r', mistakeCount: 4, mistakePercentage: 40, dominantMistakeType: 'WRONG_CHARACTER' },
        { character: 't', mistakeCount: 3, mistakePercentage: 30, dominantMistakeType: 'MISSING_CHARACTER' },
      ],
      suggestedPracticeWords: ['return', 'target', 'starter'],
    })
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))

    const weakSection = (await screen.findByRole('heading', { name: 'Keys to Improve' })).closest('section')
    expect(within(weakSection).getByText('The letters r and t need more consistent control.')).toBeVisible()
    expect(within(weakSection).getByText('40.0%')).toBeVisible()
    expect(within(weakSection).getByText('Wrong character')).toBeVisible()
    expect(within(weakSection).getByRole('heading', { name: 'Recommended Practice Words' })).toBeVisible()
    expect(within(weakSection).getByText('return')).toBeVisible()
    expect(within(weakSection).getByText('target')).toBeVisible()
  })

  it('shows a positive state when no weak keys are returned', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockResolvedValue({ ...completeResult, weakKeys: [] })
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))

    expect(await screen.findByText('No major weak keys detected in this session.')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Keys to Improve' })).not.toBeInTheDocument()
  })

  it('creates and focuses a fresh 60-second Weak Keys session locally', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockResolvedValue({
      ...completeResult,
      weakKeys: [{ character: 'r', mistakeCount: 4, mistakePercentage: 40, dominantMistakeType: 'WRONG_CHARACTER' }],
      suggestedPracticeWords: ['return', 'array', 'error'],
    })
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    await user.click(await screen.findByRole('button', { name: 'Practice Weak Keys' }))

    expect(screen.queryByRole('heading', { name: 'Your results' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Practice topic')).toHaveValue('Weak Keys')
    expect(screen.getByLabelText('Test length')).toHaveValue('60')
    expect(screen.getByText('60.0')).toBeVisible()
    expect(screen.getByLabelText('Text to type')).toHaveTextContent('return array error')
    expect(screen.getByRole('textbox', { name: 'Your typing' })).toHaveValue('')
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Your typing' })).toHaveFocus())
  })

  it('does not crash when all optional weak-key fields are absent', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockResolvedValue(completeResult)
    render(<App />)

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'A')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))

    expect(await screen.findByRole('heading', { name: 'Your results' })).toBeVisible()
    expect(screen.getByText('No major weak keys detected in this session.')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Recommended Practice Words' })).not.toBeInTheDocument()
  })

  it('preserves the attempt and retries the same analysis after a failure', async () => {
    const user = userEvent.setup()
    analyzeTyping.mockRejectedValueOnce(new Error('We could not reach the analysis service. Please try again.'))
      .mockResolvedValueOnce(completeResult)
    render(<App />)
    const input = screen.getByRole('textbox', { name: 'Your typing' })

    await user.type(input, 'A calm')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(input).toHaveValue('A calm')

    await user.click(screen.getByRole('button', { name: 'Retry Analysis' }))
    expect(await screen.findByRole('heading', { name: 'Your results' })).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(analyzeTyping.mock.calls[1][0].typedText).toBe(analyzeTyping.mock.calls[0][0].typedText)
  })

  it('announces when a pending analysis service may be waking up', async () => {
    vi.useFakeTimers()
    analyzeTyping.mockReturnValue(new Promise(() => {}))
    render(<App />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Your typing' }), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Finish Test' }))

    await act(async () => vi.advanceTimersByTime(4000))
    expect(screen.getByRole('status')).toHaveTextContent('The analysis service is starting. This may take a few moments.')
  })

  it('returns focus to the typing input after restart', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByRole('textbox', { name: 'Your typing' })
    await user.type(input, 'A')
    await user.click(screen.getByRole('button', { name: 'Restart Test' }))
    await waitFor(() => expect(input).toHaveFocus())
  })
})
