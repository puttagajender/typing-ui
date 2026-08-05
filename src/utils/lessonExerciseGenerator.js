const rotate = (items, offset) => items.map((_, index) => items[(index + offset) % items.length])

export function buildWarmups(keys, count = 8) {
  return Array.from({ length: count }, (_, index) => {
    const rotated = rotate(keys, index % keys.length)
    return index % 2 === 0
      ? `${rotated[0].repeat(5)} ${rotated[1].repeat(5)}`
      : `${rotated[0]} ${rotated[1]} ${rotated[0]} ${rotated[1]} ${rotated[1]} ${rotated[0]}`
  })
}

export function buildMovementExercises(keys, count = 16) {
  return Array.from({ length: count }, (_, index) => {
    const rotated = rotate(keys, (index * 3) % keys.length)
    const length = 4 + Math.min(4, Math.floor(index / 4))
    const forward = rotated.slice(0, length).join('')
    const alternate = Array.from({ length }, (_, position) => rotated[(position * 2 + index) % rotated.length]).join('')
    return index % 3 === 0 ? forward : index % 3 === 1 ? Array.from(forward).reverse().join('') : alternate
  }).filter((exercise, index, all) => index === 0 || exercise !== all[index - 1])
}

export function buildWordPractice(wordBank, exerciseCount = 40, wordsPerExercise = 5) {
  const ordered = [...new Set(wordBank)].sort((first, second) => first.length - second.length || first.localeCompare(second))
  return Array.from({ length: exerciseCount }, (_, exerciseIndex) => {
    const difficultyBand = Math.min(ordered.length, Math.max(3, 3 + Math.floor(exerciseIndex / 6)))
    return Array.from({ length: wordsPerExercise }, (_, wordIndex) => ordered[(exerciseIndex * 2 + wordIndex * 3) % difficultyBand]).join(' ')
  })
}

export function buildMiniChallenges(words, movements, count = 8) {
  return Array.from({ length: count }, (_, index) => {
    const first = words[(index * 2) % words.length]
    const second = words[(index * 2 + 3) % words.length]
    const movement = movements[(index * 3) % movements.length]
    return index % 2 === 0 ? `${first} ${second}` : `${movement} ${first}`
  })
}

export function validateLearnedContent(exercises, learnedKeys) {
  const allowed = new Set([...learnedKeys, ' '])
  return exercises.every((exercise) => Array.from(exercise).every((character) => allowed.has(character)))
}
