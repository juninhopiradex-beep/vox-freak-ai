const major = [0, 2, 4, 5, 7, 9, 11]
const minor = [0, 2, 3, 5, 7, 8, 10]
const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

export type KeyGuess = { key: string; root: number; mode: 'Major' | 'Minor'; confidence: number }

export function detectKey(midis: number[]): KeyGuess {
  if (!midis.length) return { key: 'C Major', root: 0, mode: 'Major', confidence: 0 }
  const pcs = Array(12).fill(0)
  midis.forEach(m => pcs[((Math.round(m) % 12) + 12) % 12]++)
  let best = { score: -1, root: 0, mode: 'Major' as 'Major' | 'Minor' }
  for (let root = 0; root < 12; root++) {
    for (const [mode, scale] of [['Major', major], ['Minor', minor]] as const) {
      let score = 0
      for (let pc = 0; pc < 12; pc++) {
        const inScale = scale.includes((pc - root + 12) % 12)
        score += pcs[pc] * (inScale ? 1 : -0.65)
      }
      if (score > best.score) best = { score, root, mode }
    }
  }
  const total = pcs.reduce((a, b) => a + b, 0)
  const confidence = Math.max(0, Math.min(0.99, 0.5 + best.score / Math.max(1, total) * 0.45))
  return { key: `${names[best.root]} ${best.mode}`, root: best.root, mode: best.mode, confidence }
}

export function snapMidiToKey(midi: number, root: number, mode: 'Major' | 'Minor') {
  const scale = mode === 'Major' ? major : minor
  let best = Math.round(midi)
  let dist = Infinity
  for (let n = Math.floor(midi) - 2; n <= Math.ceil(midi) + 2; n++) {
    const pc = ((n - root) % 12 + 12) % 12
    if (scale.includes(pc)) {
      const d = Math.abs(n - midi)
      if (d < dist) { dist = d; best = n }
    }
  }
  return best
}
