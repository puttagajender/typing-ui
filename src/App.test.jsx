import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { PASSAGE } from './data/passages'
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
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    analyzeTyping.mockReset()
    analyzeTyping.mockResolvedValue(completeResult)
  })

  it('shows the initial application, passage, accessible controls, and zero elapsed time', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Typing Coach' })).toBeVisible()
    expect(screen.getByLabelText('Text to type')).toHaveTextContent(PASSAGE)
    expect(screen.getByRole('textbox', { name: 'Your typing' })).toBeEnabled()
    expect(screen.getByText('0.0')).toBeVisible()
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
    expect(screen.getByText('0.0')).toBeVisible()
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

    await user.type(screen.getByRole('textbox', { name: 'Your typing' }), 'Ev')
    await user.click(screen.getByRole('button', { name: 'Finish Test' }))
    await waitFor(() => expect(analyzeTyping).toHaveBeenCalledOnce())

    const request = analyzeTyping.mock.calls[0][0]
    expect(request).toMatchObject({ originalText: PASSAGE, typedText: 'Ev' })
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

    expect(await screen.findByText('37.8')).toBeVisible()
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

    expect(within(panel).getByText('Gross WPM').nextElementSibling).toHaveTextContent('—')
    expect(within(panel).getByText('Total Mistakes').nextElementSibling).toHaveTextContent('0')
    expect(within(panel).getByText('Wrong Characters').nextElementSibling).toHaveTextContent('0')
    expect(within(panel).getByText('Missing Characters').nextElementSibling).toHaveTextContent('0')
    expect(within(panel).getByText('Extra Characters').nextElementSibling).toHaveTextContent('Not available')
    expect(within(panel).getByText('Excellent accuracy — now focus on speed.')).toBeVisible()
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
})
