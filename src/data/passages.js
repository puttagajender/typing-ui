export const PASSAGES = {
  beginner: [
    'A calm morning gives me time to plan my day, drink some water, and begin each task with a clear mind.',
    'The small brown dog waits by the garden gate and wags its tail whenever a friendly neighbor walks past.',
    'Fresh fruit, warm toast, and a cup of tea make a simple breakfast that helps me feel ready for the day.',
    'I keep my desk clean so I can find my notebook, pencils, and other useful items without wasting time.',
    'We walked along the quiet path, listened to the birds, and watched soft clouds move across the blue sky.',
    'Learning a new skill takes patience, regular practice, and the courage to try again after making mistakes.',
    'My friend brings a bright red ball to the park, where we play until the evening air begins to feel cool.',
    'A good book can turn a rainy afternoon into an exciting journey filled with ideas, places, and people.',
    'Every day I improve my typing skills by practising carefully and focusing on accuracy before speed.',
    'The kitchen smells wonderful when vegetables, herbs, and warm bread are prepared for a family meal.',
  ],
  intermediate: [
    'Consistent typing practice builds confidence because familiar key patterns gradually become automatic, leaving more attention for the ideas being written.',
    'Before starting a difficult project, divide the work into clear stages, estimate the time required, and complete one manageable task at a time.',
    'A thoughtful morning routine can create momentum for the entire day, especially when it includes movement, planning, and a few quiet minutes.',
    'Public libraries provide more than books; they offer welcoming spaces where people can study, explore technology, and connect with their community.',
    'When a conversation becomes complicated, careful listening often reveals the concern behind the words and makes a practical solution easier to find.',
    'Healthy teams share progress openly, ask useful questions, and treat unexpected problems as opportunities to improve their process together.',
    'Exploring a new city on foot reveals small details that are easy to miss, from local gardens and painted doors to busy neighborhood markets.',
    'Accurate notes are valuable because they preserve important decisions, clarify responsibilities, and help everyone remember what should happen next.',
    'A balanced approach to learning combines focused repetition with regular breaks, allowing the mind to strengthen new patterns without becoming exhausted.',
    'Digital tools can save time when they are chosen carefully, configured simply, and used to support clear goals rather than create extra distractions.',
  ],
  advanced: [
    'Although rapid communication can accelerate a project, precision remains essential; an ambiguous sentence may create hours of unnecessary discussion, duplicated effort, and avoidable frustration.',
    'Meaningful expertise develops through deliberate practice: identify a narrow weakness, attempt a challenging exercise, evaluate the result honestly, and adjust the next attempt accordingly.',
    'Communities become more resilient when residents understand local risks, maintain trustworthy relationships, and coordinate practical responses before an unexpected disruption occurs.',
    'A persuasive explanation does not merely present information; it anticipates reasonable objections, distinguishes evidence from assumption, and guides the reader through a coherent line of thought.',
    'Sustainable improvement rarely depends on dramatic motivation. It emerges from modest systems that make beneficial actions convenient, measurable, and repeatable under ordinary circumstances.',
    'When evaluating a complex proposal, examine its immediate benefits, long-term maintenance costs, hidden dependencies, and possible consequences for people who were not represented in the discussion.',
    'Curiosity transforms uncertainty from a threat into an invitation: instead of defending the first plausible answer, a careful thinker searches for contradictions, context, and stronger alternatives.',
    'Effective leadership requires enough confidence to make timely decisions and enough humility to revise those decisions when credible evidence reveals that the original assumptions were incomplete.',
    'The quality of a technical system depends not only on its visible features, but also on its reliability, accessibility, security, documentation, and capacity to evolve without needless disruption.',
    'Deep work becomes possible when attention is protected deliberately; clear priorities, limited interruptions, and realistic boundaries create the conditions for sustained intellectual effort.',
  ],
  programming: [
    'A readable function should have one clear responsibility, descriptive names, predictable inputs, and a return value that callers can understand without studying hidden implementation details.',
    'When an asynchronous request fails, the interface should preserve user input, explain what happened in plain language, and provide a safe path to retry the operation.',
    'const total = values.reduce((sum, value) => sum + value, 0); This expression visits each value once and returns a new total without changing the original array.',
    'A useful code review checks correctness, clarity, accessibility, performance, and tests while giving specific feedback that helps the author improve the change.',
    'if (response.ok) { return response.json(); } A robust implementation must also handle invalid data, network failures, and useful error messages for the person using the application.',
    'Components are easier to maintain when data flows in one direction, side effects stay at clear boundaries, and presentation details do not control business rules.',
    'A regression test should describe observable behavior, arrange only the necessary context, perform a realistic action, and assert the outcome that matters to the user.',
    'Use semantic HTML before adding custom accessibility behavior: a button, label, heading, or progress element already provides meaning that browsers and assistive tools understand.',
    'Caching can reduce repeated work, but every cache needs an explicit strategy for expiration, invalidation, capacity, and behavior when the stored value is unavailable.',
    'Small commits with focused intent are easier to review and reverse because each change explains one decision without mixing unrelated formatting, refactoring, and feature work.',
  ],
}

export const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'programming', label: 'Programming' },
]

export const TEST_MODES = [
  { value: 'complete', label: 'Complete Passage', duration: null },
  { value: '30', label: '30 Seconds', duration: 30 },
  { value: '60', label: '60 Seconds', duration: 60 },
  { value: '120', label: '120 Seconds', duration: 120 },
]

export const PASSAGE = PASSAGES.beginner[0]
