import { DIFFICULTIES, PASSAGES } from '../data/passages'

const difficultyRank = (difficulty) =>
  DIFFICULTIES.find((item) => item.value === difficulty)?.rank ?? 0

const withoutImmediateRepeat = (passages, lastPassageId) => {
  if (passages.length <= 1) return passages
  const alternatives = passages.filter((passage) => passage.id !== lastPassageId)
  return alternatives.length ? alternatives : passages
}

const pickRandom = (passages, random) => passages[Math.floor(random() * passages.length)]

export function selectPassage({
  category,
  difficulty,
  lastPassageId = null,
  passages = PASSAGES,
  random = Math.random,
}) {
  const exact = passages.filter((passage) =>
    passage.category === category && passage.difficulty === difficulty,
  )
  if (exact.length) return pickRandom(withoutImmediateRepeat(exact, lastPassageId), random)

  const sameCategory = passages
    .filter((passage) => passage.category === category)
    .sort((first, second) =>
      Math.abs(difficultyRank(first.difficulty) - difficultyRank(difficulty)) -
      Math.abs(difficultyRank(second.difficulty) - difficultyRank(difficulty)),
    )
  if (sameCategory.length) {
    const nearestDistance = Math.abs(difficultyRank(sameCategory[0].difficulty) - difficultyRank(difficulty))
    const nearest = sameCategory.filter((passage) =>
      Math.abs(difficultyRank(passage.difficulty) - difficultyRank(difficulty)) === nearestDistance,
    )
    return pickRandom(withoutImmediateRepeat(nearest, lastPassageId), random)
  }

  const generalEnglish = passages.filter((passage) =>
    passage.category === 'General English' && passage.difficulty === difficulty,
  )
  if (generalEnglish.length) return pickRandom(withoutImmediateRepeat(generalEnglish, lastPassageId), random)

  if (!passages.length) return null
  return pickRandom(withoutImmediateRepeat(passages, lastPassageId), random)
}
