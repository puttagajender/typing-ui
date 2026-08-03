export const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'Turtle — Beginner', rank: 0 },
  { value: 'INTERMEDIATE', label: 'Rabbit — Intermediate', rank: 1 },
  { value: 'ADVANCED', label: 'Horse — Advanced', rank: 2 },
  { value: 'EXPERT', label: 'Cheetah — Expert', rank: 3 },
]

export const CATEGORIES = [
  'General English',
  'Common Words',
  'Business English',
  'Programming',
  'Java',
  'Spring Boot',
  'SQL',
  'Git',
  'Weak Keys',
]

export const TEST_MODES = [
  { value: '30', label: '30 seconds', duration: 30 },
  { value: '60', label: '60 seconds', duration: 60 },
  { value: '120', label: '120 seconds', duration: 120 },
  { value: 'complete', label: 'Complete passage', duration: null },
  { value: 'custom', label: 'Custom', duration: null },
]

const passageGroups = {
  'General English': [
    ['BEGINNER', 'A quiet morning gives me time to open the window, plan my day, and begin each task with a clear mind.'],
    ['BEGINNER', 'The little dog waits beside the garden gate and wags its tail when a friendly neighbor walks past.'],
    ['INTERMEDIATE', 'Regular practice turns unfamiliar movements into comfortable habits, especially when each session has one clear purpose.'],
    ['INTERMEDIATE', 'Walking through a new neighborhood reveals painted doors, small gardens, busy shops, and unexpected places to rest.'],
    ['ADVANCED', 'A persuasive explanation anticipates reasonable questions, separates evidence from assumption, and develops its conclusion with patience.'],
    ['ADVANCED', 'Sustainable improvement usually grows from modest routines that remain useful even when motivation is temporarily low.'],
    ['EXPERT', 'Curiosity transforms uncertainty into an invitation to examine context, challenge convenient assumptions, and consider stronger alternatives.'],
    ['EXPERT', 'Meaningful expertise emerges through deliberate repetition, honest evaluation, and increasingly precise adjustments to difficult work.'],
  ],
  'Common Words': [
    ['BEGINNER', 'We can make a good plan, take our time, and help each other finish the work before the end of the day.'],
    ['BEGINNER', 'She put the book on the table, found her blue pen, and wrote a short note for her best friend.'],
    ['INTERMEDIATE', 'People often learn faster when they ask clear questions, use simple examples, and connect new ideas with things they know.'],
    ['INTERMEDIATE', 'A small change in the way we spend our time can make an ordinary week feel calmer and more productive.'],
    ['ADVANCED', 'The most familiar words can still express subtle ideas when they are arranged with care, rhythm, and attention to context.'],
    ['ADVANCED', 'Clear language respects the reader by presenting necessary detail without allowing needless complexity to obscure the central point.'],
    ['EXPERT', 'Fluent communication depends less on unusual vocabulary than on deliberate structure, precise emphasis, and an awareness of audience.'],
    ['EXPERT', 'Frequently used words become powerful instruments when a writer understands their connotations, cadence, and relationship to surrounding sentences.'],
  ],
  'Business English': [
    ['BEGINNER', 'Please send the updated report before lunch so the team can review the numbers during our afternoon meeting.'],
    ['BEGINNER', 'Our customer asked a clear question, and we promised to reply with the correct information by tomorrow morning.'],
    ['INTERMEDIATE', 'A useful project update summarizes completed work, current risks, upcoming decisions, and the person responsible for each action.'],
    ['INTERMEDIATE', 'Before the meeting ends, confirm the agreed deadline and record any questions that require additional research.'],
    ['ADVANCED', 'Successful negotiations identify shared interests, clarify genuine constraints, and avoid treating every disagreement as a fixed position.'],
    ['ADVANCED', 'An effective proposal explains the expected value, implementation cost, measurable outcome, and major risks without hiding uncertainty.'],
    ['EXPERT', 'Strategic planning requires leaders to distinguish temporary market noise from durable changes in customer behavior and operational capacity.'],
    ['EXPERT', 'Responsible governance combines timely decisions with transparent accountability, credible evidence, and mechanisms for revising flawed assumptions.'],
  ],
  Programming: [
    ['BEGINNER', 'A variable stores a value, while a function groups instructions that can be called whenever the program needs them.'],
    ['BEGINNER', 'Readable code uses clear names, consistent spacing, and small steps that another developer can follow without guessing.'],
    ['INTERMEDIATE', 'Components are easier to maintain when data moves in one direction and side effects remain at clear application boundaries.'],
    ['INTERMEDIATE', 'A useful test arranges the required context, performs a realistic action, and verifies an outcome that matters to the user.'],
    ['ADVANCED', 'Asynchronous workflows should preserve user input, expose meaningful progress, and recover safely when a dependency becomes unavailable.'],
    ['ADVANCED', 'Good abstractions remove repeated decisions without concealing the important constraints that callers must understand.'],
    ['EXPERT', 'Concurrency improves throughput only when shared state, cancellation, ordering guarantees, and failure propagation are designed explicitly.'],
    ['EXPERT', 'A resilient architecture makes dependencies visible, limits the scope of failure, and supports incremental change without systemic disruption.'],
  ],
  Java: [
    ['BEGINNER', 'A Java class describes data and behavior, and its methods define the operations that each object can perform.'],
    ['BEGINNER', 'Use descriptive variable names and keep each Java method focused on one task that is easy to explain.'],
    ['INTERMEDIATE', 'Interfaces define useful contracts, allowing different Java classes to provide behavior without sharing one implementation.'],
    ['INTERMEDIATE', 'Collections such as lists, sets, and maps organize values according to different access and uniqueness requirements.'],
    ['ADVANCED', 'Immutable Java objects reduce accidental state changes and make concurrent behavior easier to understand and test.'],
    ['ADVANCED', 'Exception handling should add context at meaningful boundaries while preserving the original cause for diagnosis.'],
    ['EXPERT', 'Generic type constraints can express reusable algorithms safely, but excessive abstraction may make ordinary code difficult to navigate.'],
    ['EXPERT', 'Efficient JVM applications balance allocation patterns, garbage collection behavior, concurrency, and evidence gathered through measurement.'],
  ],
  'Spring Boot': [
    ['BEGINNER', 'Spring Boot helps a Java application start with sensible defaults and a clear place for configuration.'],
    ['BEGINNER', 'A controller receives an HTTP request and returns a response that the client can understand.'],
    ['INTERMEDIATE', 'Dependency injection keeps object construction separate from business behavior and makes collaborators easier to replace in tests.'],
    ['INTERMEDIATE', 'Configuration properties group related settings and allow each environment to provide appropriate external values.'],
    ['ADVANCED', 'A reliable REST endpoint validates incoming data, uses consistent status codes, and returns errors in a predictable structure.'],
    ['ADVANCED', 'Transactional service boundaries should reflect business operations rather than simply wrapping every repository method.'],
    ['EXPERT', 'Production observability combines structured logs, meaningful metrics, distributed traces, and alerts tied to user-visible symptoms.'],
    ['EXPERT', 'Secure Spring Boot services apply authentication, authorization, validation, and careful data exposure at clearly defined boundaries.'],
  ],
  SQL: [
    ['BEGINNER', 'A SELECT query reads columns from a table and can filter rows with a clear WHERE condition.'],
    ['BEGINNER', 'Use an ORDER BY clause when query results must appear in a predictable sequence.'],
    ['INTERMEDIATE', 'A JOIN combines related rows from multiple tables by comparing columns that represent the same relationship.'],
    ['INTERMEDIATE', 'Aggregate functions summarize groups of rows, while HAVING filters the grouped results after calculation.'],
    ['ADVANCED', 'A useful database index supports frequent access patterns, but every additional index increases storage and write costs.'],
    ['ADVANCED', 'Transaction isolation balances consistency and concurrency by controlling which intermediate changes other operations can observe.'],
    ['EXPERT', 'Query optimization requires evidence from execution plans, realistic data distribution, indexing strategy, and measured workload behavior.'],
    ['EXPERT', 'Reliable schema evolution preserves compatibility across deployments and provides a deliberate path for migrating existing production data.'],
  ],
  Git: [
    ['BEGINNER', 'A Git commit records a focused change and includes a message that explains why the change was useful.'],
    ['BEGINNER', 'Create a branch before starting new work so the main line remains stable while the change develops.'],
    ['INTERMEDIATE', 'Review the staged diff before committing to catch accidental files, debugging code, and unrelated formatting changes.'],
    ['INTERMEDIATE', 'A merge combines branch histories, while a rebase replays commits onto a different starting point.'],
    ['ADVANCED', 'Small, coherent commits are easier to review, test, revert, and understand when investigating a later regression.'],
    ['ADVANCED', 'Resolve merge conflicts by understanding both intended changes instead of automatically choosing one side of the file.'],
    ['EXPERT', 'A disciplined release workflow uses protected branches, automated checks, traceable reviews, and recoverable deployment markers.'],
    ['EXPERT', 'Rewriting shared history can disrupt collaborators, so destructive Git operations require explicit coordination and a clear recovery plan.'],
  ],
}

export const PASSAGES = Object.entries(passageGroups).flatMap(([category, entries]) =>
  entries.map(([difficulty, text], index) => ({
    id: `${category.toLowerCase().replaceAll(' ', '-')}-${index + 1}`,
    category,
    difficulty,
    text,
  })),
)

export const PASSAGE = PASSAGES.find(
  (passage) => passage.category === 'General English' && passage.difficulty === 'BEGINNER',
).text
