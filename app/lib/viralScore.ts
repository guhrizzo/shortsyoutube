export function calculateViralScore(
  duration: number,
  hooks: any[]
) {

  let score = 50

  if (duration <= 30) score += 20
  if (duration <= 45) score += 10

  score += hooks.length * 5

  return Math.min(score, 100)
}