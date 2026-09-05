// Envelope cross-correlation for transparent vocal timing suggestions.
export function estimateOffsetMs(master: Float32Array, slave: Float32Array, sampleRate: number, maxMs = 180) {
  const stride = Math.max(16, Math.floor(sampleRate / 1000))
  const maxLag = Math.floor((maxMs / 1000) * sampleRate / stride)
  const len = Math.min(master.length, slave.length)
  if (len < sampleRate / 4) return 0

  const envelope = (data: Float32Array) => {
    const arr: number[] = []
    for (let i = 0; i < len; i += stride) {
      let sum = 0
      const end = Math.min(len, i + stride)
      for (let j = i; j < end; j++) sum += Math.abs(data[j])
      arr.push(sum / Math.max(1, end - i))
    }
    return arr
  }
  const a = envelope(master)
  const b = envelope(slave)
  let bestLag = 0
  let bestScore = -Infinity

  for (let lag = -maxLag; lag <= maxLag; lag++) {
    let score = 0
    let count = 0
    for (let i = 0; i < a.length; i += 4) {
      const j = i + lag
      if (j < 0 || j >= b.length) continue
      score += a[i] * b[j]
      count++
    }
    if (count && score > bestScore) {
      bestScore = score
      bestLag = lag
    }
  }
  return Math.round((bestLag * stride / sampleRate) * 1000)
}
