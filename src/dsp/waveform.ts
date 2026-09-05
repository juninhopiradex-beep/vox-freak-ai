export function makeWaveform(samples: Float32Array, points = 900): Float32Array {
  const out = new Float32Array(points)
  const block = Math.max(1, Math.floor(samples.length / points))
  for (let i = 0; i < points; i++) {
    const start = i * block
    const end = Math.min(samples.length, start + block)
    let peak = 0
    for (let j = start; j < end; j++) peak = Math.max(peak, Math.abs(samples[j]))
    out[i] = peak
  }
  return out
}

export function bufferToMono(buffer: AudioBuffer): Float32Array {
  const out = new Float32Array(buffer.length)
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const ch = buffer.getChannelData(c)
    for (let i = 0; i < out.length; i++) out[i] += ch[i] / buffer.numberOfChannels
  }
  return out
}
